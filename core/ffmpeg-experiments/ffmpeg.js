const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');


ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const vidLocations = ['videos/input-test.mp4', 'videos/input-test-2.mp4'];
const updateLivePlaylist = (vidLocation) => {
    return new Promise((resolve, reject) => {
        console.log('vidLocation', vidLocation)
        console.log(new Date().toUTCString());


        ffmpeg()
            .addInput(vidLocation)
            .addOptions([
                '-profile:v baseline',
                '-level 3.0',
                '-start_number 0',
                '-hls_time 10',
                '-hls_playlist_type event',
                '-hls_list_size 0',
                '-hls_flags append_list+omit_endlist+program_date_time',
                '-f hls'

            ]).output('videos/output.m3u8').on('end', () => {
                resolve();
            }).on('error', (error) => {
                console.log('error---', error)
            }).run();
    });
}
const run = async () => {
    for (const vidLocation in vidLocations) {
        console.log('vid locations', vidLocations[vidLocation]);
        await updateLivePlaylist(vidLocations[vidLocation]);
    }
}

run();
