import fs from 'fs-extra';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import pathToFfmpeg from 'ffmpeg-static';

import { Scene } from "./entity/Scene";
import { Event } from "./entity/Event";
import { StreamStatus } from './enums';
import { getLiveEvent } from "./services/db";
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
            '-profile:v baseline', // H.264 baseline profile for compatibility
            '-level 3.0',          // Level 3.0 for broader compatibility
            '-start_number 0',     // Start numbering HLS segments from 0
            '-hls_time 10',         // Set HLS segment duration to 10 seconds
            '-sc_threshold 0',     // Disable scene change detection for consistent GOPs
            `-hls_segment_filename ${segmentLocation}`, // HLS segment file naming
            '-hls_flags program_date_time+append_list+omit_endlist+independent_segments+discont_start',
            '-hls_wrap 10',        // Wrap playlist after 10 segments
            '-f hls',              // Set output format to HLS
            '-g 50',               // Set GOP size (double the framerate, e.g., 25fps x 2)
            '-b:v 800k',           // Video bitrate of 800 kbps
            '-maxrate 800k',       // Limit max bitrate to 800 kbps
            '-bufsize 1600k',      // Set buffer size to twice the max bitrate
            '-b:a 96k',            // Audio bitrate of 96 kbps
            '-ar 44100',           // Audio sample rate of 44.1 kHz
            '-vf scale=-2:360',    // Scale video to 360p height (width auto-calculated)
            '-preset veryfast',    // Fast encoding preset
            '-movflags +faststart' // Optimize MP4 for streaming
        ];

        try {
            await fs.ensureDir(newEventDirLocation);
            const tempFilePath = path.join(`temp-file-${Date.now()}.mp4`);

            // Write the string to the file

            console.log(`File saved to: ${tempFilePath}`);
            const fileContentString = await fileStorage.getFileAndSave('kodastream-media', sceneLocation);
            await fs.promises.writeFile(tempFilePath, fileContentString);


            logger.info('video-processor: Starting ffmpeg process', { sceneId: scene.id, eventId: event.id, tempFilePath });

            const ff = ffmpeg();
            ff.input(tempFilePath)
                .inputOptions('-re')
                .addOptions(ffmpegOptions)
                .output(outputLocation)
                .on('end', async () => {
                    logger.info('video-processor: FFmpeg process completed', { sceneId: scene.id, eventId: event.id });
                    await fs.promises.unlink(tempFilePath);
                    resolve(true);
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
