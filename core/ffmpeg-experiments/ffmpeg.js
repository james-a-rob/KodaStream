const ffmpeg = require('fluent-ffmpeg');
const pathToFfmpeg = require('ffmpeg-static');
const HLS = require('hls-parser');
const fs = require('fs');
const db = require('./db');
console.log(db.values);
ffmpeg.setFfmpegPath(pathToFfmpeg);

const vidLocations = ['videos/input-test.mp4', 'videos/input-test-2.mp4'];
const updateLivePlaylist = (vidLocation, sceneId) => {

    return new Promise((resolve, reject) => {
        console.log(new Date())

        ffmpeg()
            .addInput(vidLocation)
            .addOptions([
                '-profile:v baseline',
                '-level 3.0',
                '-start_number 0',
                '-hls_time 6',
                '-g 30',
                '-sc_threshold 0',
                `-hls_segment_filename videos/file-${sceneId}-%03d.ts`,
                '-hls_playlist_type event',
                '-hls_flags program_date_time+append_list+omit_endlist+independent_segments+discont_start',
                '-f hls'

            ]).output('videos/output.m3u8').on('end', () => {
                console.log('ended');
                resolve();
            }).on('start', () => {

            })
            .on('progress', () => {


            }).on('error', (error) => {
                console.log('error---', error)
            }).run();
    });
}
const run = async () => {
    let sceneId = 1;
    for (const vidLocation in vidLocations) {
        console.log('vid locations', vidLocations[vidLocation]);
        await updateLivePlaylist(vidLocations[vidLocation], sceneId);
        sceneId++;
    }
}


run();
