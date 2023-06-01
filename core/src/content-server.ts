import express, { Request, Response } from 'express';
import cors from 'cors';

import fs from 'fs';
import path from 'path';
import HLS from 'hls-parser';
import { getLiveEvent } from './db';

const app = express();
app.use(cors());

app.get('/', (req: Request, res: Response) => {
    return res.status(200).sendFile(path.join(__dirname, '../public/client.html'));
});

app.get('/ios-demo', (req: Request, res: Response) => {
    return res.status(200).sendFile(path.join(__dirname, '../public/client-ios.html'));
});

const hlsServerConfig = {
    provider: {
        exists: (req: Request, cb) => {
            const ext = req.url.split('.').pop();
            // console.log('ext', ext);
            if (ext !== 'm3u8' && ext !== 'ts') {
                return cb(null, true);
            }
            // console.log('__dirname + req.url', __dirname + req.url.replace("output", "output-initial"));
            fs.access(path.join(__dirname, `../${req.url.replace("output", "output-initial")}`), fs.constants.F_OK, function (err) {
                if (err) {
                    return cb(null, false);
                }
                cb(null, true);
            });
        },
        getManifestStream: async (req: Request, cb) => {
            //remove sync calls
            const m3u8Data = fs.readFileSync(path.join(__dirname, `../${req.url.replace("output", "output-initial")}`));
            const eventId = req.url.split("/")[2];
            const event = await getLiveEvent(eventId);

            const playlist = HLS.parse(m3u8Data.toString());
            playlist.segments.forEach((segment) => {
                const idFromSegmentFile = segment.uri.split("-")[1]

                const scene = event.scenes.filter((dbValue) => {

                    return dbValue.id.toString() === idFromSegmentFile
                });
                const dateRange = {
                    id: `video-${scene[0].id}`,
                    start: new Date(segment.programDateTime),
                    duration: segment.duration,
                    attributes: { 'X-CUSTOM-KEY': scene[0].metadata }
                }
                segment.dateRange = dateRange;
            });
            const outputPath = path.join(__dirname, `../events/${eventId}/output.m3u8`);
            fs.writeFileSync(outputPath, HLS.stringify(playlist));
            const stream = fs.createReadStream(outputPath);

            cb(null, stream);
        },
        getSegmentStream: (req: Request, cb) => {

            const stream = fs.createReadStream(path.join(__dirname, `../${req.url}`));
            cb(null, stream);
        }
    }
}

export { app, hlsServerConfig };
