const HLS = require('hls-parser');
const fs = require('fs');
const m3u8Data = fs.readFileSync('./test-m3u8-files/working-1.m3u8');

const playlist = HLS.parse(m3u8Data.toString());
const exampleDateRange = {
    id: 'event1',
    start: new Date(),
    duration: 30,
    attributes: { 'X-CUSTOM-KEY': 'added by script' }
}
playlist.segments[1].dateRange = exampleDateRange;
console.log(playlist.segments[1]);
console.log(HLS.stringify(playlist))
