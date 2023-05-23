import express, { Request, Response } from 'express';
import fs from 'fs';
import HLS from 'hls-parser';
import { getLiveEvent } from './db';

const app = express();

app.get('/', (req: Request, res: Response) => {
    return res.status(200).sendFile(`${__dirname}/client.html`);
});

const hlsServerConfig = {
    provider: {
        exists: (req: Request, cb) => {
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
        getManifestStream: async (req: Request, cb) => {
            //update daterangefirst
            console.log('getManifestStream', __dirname + req.url)
            const m3u8Data = fs.readFileSync(__dirname + req.url);
            const event = await getLiveEvent("1");

            const playlist = HLS.parse(m3u8Data.toString());
            playlist.segments.forEach((segment) => {
                console.log(segment.uri);
                const idFromSegmentFile = segment.uri.split("-")[1]
                // console.log(segment.discontinuity);
                // console.log(segment.programDateTime);
                // console.log(segment.duration);
                const scene = event.scenes.filter((dbValue) => {
                    console.log(idFromSegmentFile);
                    console.log(dbValue.id);
                    return dbValue.id === idFromSegmentFile
                });
                console.log(scene);
                const dateRange = {
                    id: 'video2',
                    start: new Date(segment.programDateTime),
                    duration: segment.duration,
                    attributes: { 'X-CUSTOM-KEY': scene[0].metadata }
                }
                segment.dateRange = dateRange;
                console.log('- - - -');
            });
            console.log(HLS.stringify(playlist))
            fs.writeFileSync(__dirname + '/videos/final-output.m3u8', HLS.stringify(playlist));
            const stream = fs.createReadStream(__dirname + req.url);

            cb(null, stream);
        },
        getSegmentStream: (req: Request, cb) => {

            const stream = fs.createReadStream(__dirname + req.url);
            cb(null, stream);
        }
    }
}

export { app, hlsServerConfig };
