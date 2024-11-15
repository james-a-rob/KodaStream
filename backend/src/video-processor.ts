import fs from 'fs-extra';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import pathToFfmpeg from 'ffmpeg-static';
import { Scene } from "./entity/Scene";
import { Event } from "./entity/Event";
import { StreamStatus } from './enums';
import { getLiveEvent } from "./db";
import FileStorage from "./services/file-storage";
import chokidar from 'chokidar';
import * as currentPath from "./current-path.cjs";
import Logger from './services/logger';

const logger = Logger.getLogger();
const current = currentPath.default;
const fileStorage = new FileStorage();
ffmpeg.setFfmpegPath(pathToFfmpeg);

const process = (scene: Scene, event: Event) => {
    return new Promise(async (resolve, reject) => {
        const sceneLocation = scene.location;
        const newEventDirLocation = path.join(current, `../events/${event.id}`);
        const segmentLocation = path.join(current, `../events/${event.id}/file-${scene.id}-%03d.ts`);
        const outputLocation = path.join(current, `../events/${event.id}/output-initial.m3u8`);
        const ffmpegOptions = [
            '-profile:v baseline',
            '-level 3.0',
            '-start_number 0',
            '-hls_time 6',
            '-sc_threshold 0',
            `-hls_segment_filename ${segmentLocation}`,
            '-hls_flags program_date_time+append_list+omit_endlist+independent_segments+discont_start',
            '-hls_wrap 10',
            '-f hls',
            '-g 25'
        ];

        try {
            await fs.ensureDir(newEventDirLocation);
            const fileLocation = await fileStorage.getFileAndSave('kodastream-media', sceneLocation);

            logger.info('video-processor: Starting ffmpeg process', { sceneId: scene.id, eventId: event.id });

            const ff = ffmpeg();
            ff.input(fileLocation)
                .inputOptions('-re')
                .addOptions(ffmpegOptions)
                .output(outputLocation)
                .on('end', () => {
                    logger.info('video-processor: FFmpeg process completed', { sceneId: scene.id, eventId: event.id });
                    resolve(true);
                })
                .on('start', () => {
                    logger.info('video-processor: FFmpeg process started', { sceneId: scene.id, eventId: event.id });
                })
                .on('progress', (data) => {
                    logger.debug('video-processor: FFmpeg progress update', { progress: data });
                })
                .on('error', (err, stdout, stderr) => {
                    logger.error('video-processor: FFmpeg process error', { error: err.message, stdout, stderr });
                    reject(err);
                })
                .run();
        } catch (err) {
            logger.error('video-processor: Error during FFmpeg processing', { error: err.message, sceneId: scene.id, eventId: event.id });
            reject(err);
        }
    });
};

const uploadToStorage = async (filePath: string, localDir: string, eventId: number) => {
    logger.info('video-processor: Attempting file upload', { filePath, eventId });

    const fileName = path.basename(filePath);
    const fullFilePath = `${localDir}/${fileName}`;
    const objectName = `${eventId}/${fileName}`;

    try {
        await fileStorage.uploadFile('kodastream-streams', fullFilePath, objectName);
        logger.info('video-processor: Uploaded file to storage', { fileName, eventId });
    } catch (err) {
        logger.error('video-processor: Error uploading to storage', { filePath, eventId, error: err.message });
    }
};

export const start = async (eventId: number) => {
    const eventDirLocation = path.join(current, `../events/${eventId}`);

    try {
        await fileStorage.deleteAllFilesInDirectory('kodastream-streams', `${eventId}`);
        logger.info('video-processor: Deleted old files from storage directory', { eventId });
    } catch (err) {
        logger.warn('video-processor: Failed to delete directory in storage', { eventId, error: err.message });
    }

    const pathExists = await fs.pathExists(eventDirLocation);
    if (pathExists) {
        await fs.emptyDir(eventDirLocation);
        logger.info('video-processor: Cleared local event directory', { eventDirLocation });
    }

    const watcher = chokidar.watch(eventDirLocation, { persistent: true, ignoreInitial: true });

    watcher
        .on('add', (filePath) => {
            if (filePath.endsWith('.ts') || filePath.endsWith('.m3u8')) {
                logger.info('video-processor: New file detected', { filePath });
                uploadToStorage(filePath, eventDirLocation, eventId);
            }
        })
        .on('change', (filePath) => {
            if (filePath.endsWith('.ts') || filePath.endsWith('.m3u8')) {
                logger.info('video-processor: File updated', { filePath });
                uploadToStorage(filePath, eventDirLocation, eventId);
            }
        });

    let nextSceneExists;
    let sceneIteration = 0;

    const liveEvent = await getLiveEvent(eventId.toString());
    const firstScene = liveEvent.scenes[0];
    if (firstScene) {
        nextSceneExists = true;
    }

    while (nextSceneExists) {
        const uptoDateLiveEvent = await getLiveEvent(eventId.toString());

        if (uptoDateLiveEvent.status === StreamStatus.Stopped) {
            watcher.close();
            logger.info('video-processor: Stream stopped, shutting down watcher', { eventId });
            break;
        }

        const sceneToStream = uptoDateLiveEvent.scenes.find((scene) => scene.id === firstScene.id + sceneIteration);

        if (sceneToStream) {
            await process(sceneToStream, uptoDateLiveEvent);
        }

        const nextScene = uptoDateLiveEvent.scenes.find((scene) => scene.id === firstScene.id + sceneIteration + 1);

        if (nextScene) {
            nextSceneExists = true;
            sceneIteration++;
        } else if (!nextScene && uptoDateLiveEvent.loop) {
            nextSceneExists = true;
            sceneIteration = 0;
        } else {
            nextSceneExists = false;
        }
    }
};
