import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

import cors from 'cors';

import fs from 'fs-extra';
import path from 'path';
import HLS from 'hls-parser';
import { getLiveEvent } from './db';

const app = express();
app.use(cors());

app.get('/', (req: Request, res: Response) => {
    return res.status(200).sendFile(path.join(__dirname, '../public/client.html'));
});

app.get('/video-js', (req: Request, res: Response) => {
    return res.status(200).sendFile(path.join(__dirname, '../public/client-video-js.html'));
});

app.get('/video-js-file', (req: Request, res: Response) => {
    return res.status(200).sendFile(path.join(__dirname, '../public/video-js.js'));
});


app.get('/hls-parser', (req: Request, res: Response) => {
    return res.status(200).sendFile(path.join(__dirname, '../public/parser.js'));
});

app.get('/hls', (req: Request, res: Response) => {
    return res.status(200).sendFile(path.join(__dirname, '../public/hls.js'));
});


app.get('/init.mp4', (req: Request, res: Response) => {
    return res.status(200).sendFile(path.join(__dirname, '../public/client.html'));
});

app.get('/ios-demo', (req: Request, res: Response) => {
    return res.status(200).sendFile(path.join(__dirname, '../public/client-ios.html'));
});

const hlsServerConfig = {
    provider: {
        exists: (req: Request, cb) => {
            const ext = req.url.split('.').pop();

            if (ext !== 'm3u8' && ext !== 'ts') {
                return cb(null, true);
            }

            fs.access(path.join(__dirname, `../${req.url.replace("output", "output-initial")}`), fs.constants.F_OK, function (err) {
                if (err) {
                    return cb(null, false);
                }
                cb(null, true);
            });
        },
        getManifestStream: async (req: Request, cb) => {
            //remove sync calls
            const eventId = req.url.split("/")[2];
            const event = await getLiveEvent(eventId);

            if (!event) {
                return cb(true, null);
            }

            const m3u8Data = fs.readFileSync(path.join(__dirname, `../${req.url.replace("output", "output-initial")}`));





            const playlist = HLS.parse(m3u8Data.toString());

            playlist.segments.forEach((segment, i) => {
                const idFromSegmentFile = segment.uri.split("-")[1]

                const scene = event.scenes.filter((dbValue) => {

                    return dbValue.id.toString() === idFromSegmentFile
                });



                const dateRange = {
                    id: `${uuidv4()}`,
                    classId: `video-${scene[0].id}`,
                    // this date cant be dynamic or safari will break
                    start: new Date("1970-01-01T00:00:00.001Z"),
                    duration: segment.duration,
                    endOnNext: "YES",
                    // add iteration so safari picks up new metadata. Should come from db
                    attributes: {'X-CUSTOM-KEY': scene[0].metadata }
                }
                segment.dateRange = dateRange;

            });


            const outputPath = path.join(__dirname, `../events/${eventId}/output.m3u8`);
            try {
                fs.writeFileSync(outputPath, HLS.stringify(playlist));

            } catch (e) {
                console.log("write failed", e);
            }

            let stream;
            try {
                stream = await fs.createReadStream(outputPath);

            } catch (e) {
                console.log("read failed")
            }


            cb(null, stream);
        },
        getSegmentStream: (req: Request, cb) => {
            console.log(req.url)
            const stream = fs.createReadStream(path.join(__dirname, `../${req.url}`));
            cb(null, stream);
        }
    }
}

export { app, hlsServerConfig };
