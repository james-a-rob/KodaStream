var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import fs from 'fs-extra';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import pathToFfmpeg from 'ffmpeg-static';
import { StreamStatus } from './enums';
import { getLiveEvent } from "./db";
import * as currentPath from "./current-path.cjs";
const current = currentPath.default;
console.log('pathToFfmpeg', pathToFfmpeg);
ffmpeg.setFfmpegPath(pathToFfmpeg);
const process = (scene, event) => {
    return new Promise((resolve, reject) => {
        const sceneLocation = path.join(current, `../${scene.location}`);
        const newEventDirLocation = path.join(current, `../events/${event.id}`);
        const segmentLocation = path.join(current, `../events/${event.id}/file-${scene.id}-%03d.ts`);
        const outputLocation = path.join(current, `../events/${event.id}/output-initial.m3u8`);
        const isLive = event.id === 34 ? true : false;
        const ffmpegOptions = isLive ?
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
            ] :
            [
                '-profile:v baseline',
                '-level 3.0',
                '-start_number 0',
                '-hls_time 6',
                '-sc_threshold 0',
                `-hls_segment_filename ${segmentLocation}`,
                '-hls_flags program_date_time+append_list',
                '-hls_playlist_type vod',
                '-f hls',
                '-g 25'
            ];
        fs.ensureDir(newEventDirLocation);
        const ff = ffmpeg();
        ff.addInput(sceneLocation)
            .inputOptions('-re')
            .addOptions(ffmpegOptions).output(outputLocation).on('end', () => {
            resolve(true);
        }).on('start', (data) => {
            // console.log('started', data)
        })
            .on('progress', (data) => {
            // console.log('progress', data);
        }).on('error', (err, stdout, stderr) => {
            console.log('error---', err, stdout, stderr);
        }).run();
    });
};
export const start = (eventId) => __awaiter(void 0, void 0, void 0, function* () {
    // clean up dir before start
    const eventDirLocation = path.join(current, `../events/${eventId}`);
    const pathExists = yield fs.pathExists(eventDirLocation);
    if (pathExists) {
        yield fs.emptyDir(eventDirLocation);
    }
    let nextSceneExists;
    let sceneIteration = 0;
    const liveEvent = yield getLiveEvent(eventId.toString());
    const firstScene = liveEvent.scenes[0];
    if (firstScene) {
        nextSceneExists = true;
    }
    while (nextSceneExists) {
        const uptoDateLiveEvent = yield getLiveEvent(eventId.toString());
        if (uptoDateLiveEvent.status === StreamStatus.Stopped) {
            break;
        }
        const sceneToStream = uptoDateLiveEvent.scenes.find((scene) => { return scene.id === firstScene.id + sceneIteration; });
        yield process(sceneToStream, uptoDateLiveEvent);
        const nextScene = uptoDateLiveEvent.scenes.find((scene) => { return scene.id === firstScene.id + sceneIteration + 1; });
        if (nextScene) {
            nextSceneExists = true;
            sceneIteration++;
        }
        else if (!nextScene && uptoDateLiveEvent.loop) {
            nextSceneExists = true;
            sceneIteration = 0;
        }
        else {
            nextSceneExists = false;
        }
    }
});
//# sourceMappingURL=video-processor.js.map