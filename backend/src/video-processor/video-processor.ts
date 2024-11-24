import fs from 'fs-extra';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import pathToFfmpeg from 'ffmpeg-static';
import { getVodConfig } from './video-config/vod';
import { getLiveConfig } from './video-config/live';

import { Scene } from "../entity/Scene";
import { Event } from "../entity/Event";
import { StreamStatus } from '../enums';
import { getLiveEvent } from "../services/db";
import FileStorage from "../services/file-storage";
import chokidar from 'chokidar';
import * as currentPath from "../current-path.cjs";
import Logger from '../services/logger';

const logger = Logger.getLogger();
const current = currentPath.default;
const fileStorage = new FileStorage();
ffmpeg.setFfmpegPath(pathToFfmpeg);



const process = (scene: Scene, event: Event) => {
    return new Promise(async (resolve, reject) => {
        const isLiveStream = event.type === 'Live' ? true : false;
        const sceneLocation = scene.location;
        const newEventDirLocation = path.join(current, `../events/${event.id}`);
        const segmentLocation = path.join(current, `../events/${event.id}/file-${scene.id}-%03d.ts`);
        const outputLocation = path.join(current, `../events/${event.id}/output-initial.m3u8`);
        const ffmpegOptions = isLiveStream ? getLiveConfig(segmentLocation) : getVodConfig(segmentLocation);
        try {
            await fs.ensureDir(newEventDirLocation);
            const tempFilePath = path.join(`temp-file-${Date.now()}.mp4`);

            // Write the string to the file
            const fileContentString = await fileStorage.getFileAndSave('kodastream-media', sceneLocation);
            await fs.promises.writeFile(tempFilePath, fileContentString);


            logger.info('video-processor: Starting ffmpeg process', { sceneId: scene.id, eventId: event.id, tempFilePath });



            const ff = ffmpeg();
            ff.input(tempFilePath)
                .inputOptions(isLiveStream ? ['-re'] : [])
                .addOptions(ffmpegOptions)
                .output(outputLocation)
                .on('end', async () => {
                    logger.info('video-processor: FFmpeg process completed', { sceneId: scene.id, eventId: event.id });
                    await fs.promises.unlink(tempFilePath);
                    resolve(ff);
                })
                .on('start', () => {
                    logger.info('video-processor: FFmpeg process started', { sceneId: scene.id, eventId: event.id });
                })
                .on('progress', (data) => {
                    logger.silly('video-processor: FFmpeg progress update', { progress: data });
                })
                .on('error', async (err, stdout, stderr) => {
                    await fs.promises.unlink(tempFilePath);
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
        logger.error('video-processor: Error uploading to storage', { filePath, eventId, error: err });
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

    logger.info('video-processor: Setting up watch', { eventDirLocation });

    const watcher = chokidar.watch(eventDirLocation, {
        persistent: true, ignoreInitial: true, awaitWriteFinish: { stabilityThreshold: 500, pollInterval: 100 },
    });


    watcher
        .on('add', (filePath) => {
            if (filePath.endsWith('.ts') || filePath.endsWith('.m3u8')) {
                const fileSize = fs.statSync(filePath).size; // Get the file size in bytes
                logger.info('video-processor: New file detected', { filePath, fileSize });
                uploadToStorage(filePath, eventDirLocation, eventId);
            }
        })
        .on('change', (filePath) => {
            if (filePath.endsWith('.ts') || filePath.endsWith('.m3u8')) {
                const fileSize = fs.statSync(filePath).size; // Get the file size in bytes
                logger.info('video-processor: File updated', { filePath, fileSize });
                uploadToStorage(filePath, eventDirLocation, eventId);
            }
        });

    let nextSceneExists;
    let sceneIteration = 0;

    const liveEvent = await getLiveEvent(eventId.toString());
    const isLiveStream = liveEvent.type === 'Live' ? true : false;

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

            const videoProcess = await process(sceneToStream, uptoDateLiveEvent);
        }

        const nextScene = uptoDateLiveEvent.scenes.find((scene) => scene.id === firstScene.id + sceneIteration + 1);

        if (nextScene) {
            nextSceneExists = true;
            sceneIteration++;
        } else if (!nextScene && uptoDateLiveEvent.loop && isLiveStream) {
            nextSceneExists = true;
            sceneIteration = 0;
        } else {
            nextSceneExists = false;
        }
    }
};
