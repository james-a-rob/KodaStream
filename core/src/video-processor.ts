import fs from 'fs-extra';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import pathToFfmpeg from 'ffmpeg-static';
import { Scene } from "./entity/Scene";
import { Event } from "./entity/Event";

import { getLiveEvent } from "./db";

ffmpeg.setFfmpegPath(pathToFfmpeg);

const process = (scene: Scene, event: Event) => {
    return new Promise((resolve, reject) => {
        const sceneLocation = path.join(__dirname, scene.location);
        const newEventDirLocation = path.join(__dirname, `events/${event.id}`);
        const segmentLocation = path.join(__dirname, `events/${scene.id}/file-${scene.id}-%03d.ts`);
        const outputLocation = path.join(__dirname, `events/${event.id}/output-initial.m3u8`);

        fs.ensureDir(newEventDirLocation)

        ffmpeg()
            .addInput(sceneLocation)
            .addOptions([
                '-profile:v baseline',
                '-level 3.0',
                '-start_number 0',
                '-hls_time 6',
                '-g 30',
                '-sc_threshold 0',
                `-hls_segment_filename ${segmentLocation}`,
                '-hls_playlist_type event',
                '-hls_flags program_date_time+append_list+omit_endlist+independent_segments+discont_start',
                '-f hls'

            ]).output(outputLocation).on('end', () => {
                resolve(true);
            }).on('start', (data) => {
                // console.log(data);
            })
            .on('progress', (data) => {
                // console.log(data);

            }).on('error', (err, stdout, stderr) => {
                console.log('error---', err, stdout, stderr)
            }).run();
    });
}

export const start = (eventId: number) => {
    const run = async () => {

        let nextSceneExists;
        let sceneIteration = 0;
        const liveEvent = await getLiveEvent(eventId.toString());
        const firstScene = liveEvent.scenes[0];
        if (firstScene) {
            nextSceneExists = true;
        }
        while (nextSceneExists) {

            const uptoDateLiveStream = await getLiveEvent(eventId.toString());

            const sceneToStream = uptoDateLiveStream.scenes.find((scene) => { return scene.id === firstScene.id + sceneIteration });

            process(sceneToStream, liveEvent);
            const nextScene = uptoDateLiveStream.scenes.find((scene) => { return scene.id === firstScene.id + sceneIteration + 1 });

            if (nextScene) {
                nextSceneExists = true;
            } else {
                nextSceneExists = false;
            }
            sceneIteration++;

        }
    }
    run();


}