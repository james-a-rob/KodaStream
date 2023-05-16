const app = require('express')();
const fs = require('fs');
const hls = require('hls-server');
const HLS = require('hls-parser');
const db = require('./db');

app.get('/', (req, res) => {
    return res.status(200).sendFile(`${__dirname}/client.html`);
});

const server = app.listen(3000);

new hls(server, {
    provider: {
        exists: (req, cb) => {
            const ext = req.url.split('.').pop();

            if (ext !== 'm3u8' && ext !== 'ts') {
                return cb(null, true);
            }

            fs.access(__dirname + req.url, fs.constants.F_OK, function (err) {
                if (err) {
                    console.log('File not exist');
                    return cb(null, false);
                }
                cb(null, true);
            });
        },
        getManifestStream: (req, cb) => {
            //update daterangefirst
            console.log('getManifestStream', __dirname + req.url)
            const m3u8Data = fs.readFileSync(__dirname + req.url);
            console.log(db.values);

            const playlist = HLS.parse(m3u8Data.toString());
            playlist.segments.forEach((segment) => {
                console.log(segment.uri);
                const idFromSegmentFile = segment.uri.split("-")[1]
                // console.log(segment.discontinuity);
                // console.log(segment.programDateTime);
                // console.log(segment.duration);
                const scene = db.values.filter((dbValue) => {
                    console.log(idFromSegmentFile);
                    console.log(dbValue.id);
                    return dbValue.id === idFromSegmentFile
                });
                console.log(scene);
                const dateRange = {
                    id: 'video2',
                    start: new Date(segment.programDateTime),
                    duration: segment.duration,
                    attributes: { 'X-CUSTOM-KEY': scene[0].metaData }
                }
                segment.dateRange = dateRange;
                console.log('- - - -');
            });
            console.log(HLS.stringify(playlist))
            fs.writeFileSync(__dirname + '/videos/final-output.m3u8', HLS.stringify(playlist));
            const stream = fs.createReadStream(__dirname + req.url);

            cb(null, stream);
        },
        getSegmentStream: (req, cb) => {

            const stream = fs.createReadStream(__dirname + req.url);
            cb(null, stream);
        }
    }
});