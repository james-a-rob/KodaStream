import fs from 'fs-extra';
import path from 'path';

import ffmpeg from 'fluent-ffmpeg';

import pathToFfmpeg from 'ffmpeg-static';
import { Scene } from "./entity/Scene";
import { Event } from "./entity/Event";
import { StreamStatus } from './enums';
import { getLiveEvent } from "./db";
import MinioClient from "./services/file-storage";
import chokidar from 'chokidar';

import * as currentPath from "./current-path.cjs";

const current = currentPath.default;

ffmpeg.setFfmpegPath(pathToFfmpeg);

const process = (scene: Scene, event: Event) => {
    return new Promise((resolve, reject) => {

        const sceneLocation = path.join(current, `../${scene.location}`);
        const newEventDirLocation = path.join(current, `../events/${event.id}`);
        const segmentLocation = path.join(current, `../events/${event.id}/file-${scene.id}-%03d.ts`);
        const outputLocation = path.join(current, `../events/${event.id}/output-initial.m3u8`);
        const ffmpegOptions =
            [
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
        fs.ensureDir(newEventDirLocation)
        const ff = ffmpeg()

        const watcher = chokidar.watch(newEventDirLocation, { persistent: true });

        watcher.on('add', (filePath) => {
            if (filePath.endsWith('.ts') || filePath.endsWith('.m3u8')) {
                // console.log(`New file detected: ${filePath}`);
                uploadToMinio(filePath, newEventDirLocation, event.id);
            }
        }).on('change', (filePath) => {
            if (filePath.endsWith('.ts') || filePath.endsWith('.m3u8')) {
                // console.log(`New file detected: ${filePath}`);
                uploadToMinio(filePath, newEventDirLocation, event.id);
            }
        });


        ff.addInput(sceneLocation)
            .inputOptions(
                '-re',
            )
            .addOptions(ffmpegOptions).output(outputLocation).on('end', () => {
                resolve(true);
            }).on('start', (data) => {
                // console.log('started', data)
            })
            .on('progress', (data) => {
                // console.log('progress', data);

            }).on('error', (err, stdout, stderr) => {
                console.log('error---', err, stdout, stderr)
            }).run();

    });
}

const uploadToMinio = async (filePath: string, localDir: string, eventId: number) => {
    const fileName = path.basename(filePath);
    const fullFilePath = `${localDir}/${fileName}`;
    const objectName = `${eventId}/${fileName}`;
    try {
        // Upload the file to Minio
        await MinioClient.uploadFile('streams', fullFilePath, objectName);
        console.log(`Uploaded ${fileName} to Minio`);

        // Optionally, remove the local file after upload
        // fs.removeSync(filePath);
        console.log(`Removed local file: ${filePath}`);
    } catch (err) {
        console.error('Error uploading to Minio:', err);
    }
};

// this needs to listen for event instead
export const start = async (eventId: number) => {
    // clean up dir before start
    const eventDirLocation = path.join(current, `../events/${eventId}`);
    const pathExists = await fs.pathExists(eventDirLocation);
    if (pathExists) {
        await fs.emptyDir(eventDirLocation)

    }


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
            break;
        }


        const sceneToStream = uptoDateLiveEvent.scenes.find((scene) => { return scene.id === firstScene.id + sceneIteration });


        await process(sceneToStream, uptoDateLiveEvent);
        const nextScene = uptoDateLiveEvent.scenes.find((scene) => { return scene.id === firstScene.id + sceneIteration + 1 });

        if (nextScene) {
            nextSceneExists = true;
            sceneIteration++;

        } else if (!nextScene && uptoDateLiveEvent.loop) {
            nextSceneExists = true;
            sceneIteration = 0;

        }
        else {
            nextSceneExists = false;
        }

    }

}
