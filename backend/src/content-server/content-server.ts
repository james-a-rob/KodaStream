import express, { Request, Response } from 'express';
import { IncomingMessage } from 'http';

import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';
import fs from 'fs-extra';
import path from 'path';
import HLS from 'hls-parser';
import { getLiveEvent } from '../db';
import { Readable } from 'stream';

import MinioClient from '../services/file-storage';
import * as currentPath from "../current-path.cjs";

const current = currentPath.default;




const app = express();
app.use(cors());


app.get('/hls-parser', (req: Request, res: Response) => {
    return res.status(200).sendFile(path.join(current, '../public/parser.js'));
});

app.get('/hls', (req: Request, res: Response) => {
    return res.status(200).sendFile(path.join(current, '../public/hls.js'));
});

app.get('/koda-player', (req: Request, res: Response) => {
    return res.status(200).sendFile(path.join(current, '../public/koda-player.js'));
});


app.get('/init.mp4', (req: Request, res: Response) => {
    return res.status(200).sendFile(path.join(current, '../public/client.html'));
});

app.get('/ios-demo', (req: Request, res: Response) => {
    return res.status(200).sendFile(path.join(current, '../public/client-ios.html'));
});

function removeEventsPrefix(filePath) {
    return filePath.replace(/^\/?events\//, '');
}

const streamToString = (stream: Readable): Promise<string> => {
    return new Promise((resolve, reject) => {
        let data = '';

        // Handle the 'data' event to accumulate chunks into the data string
        stream.on('data', (chunk: Buffer) => {
            data += chunk.toString(); // Convert chunk to string and append it
        });

        // Handle the 'end' event when the stream has been fully consumed
        stream.on('end', () => {
            resolve(data); // Resolve the promise with the accumulated string
        });

        // Handle errors during the stream reading process
        stream.on('error', (err) => {
            reject(err); // Reject the promise in case of error
        });
    });
};


const hlsServerConfig = {
    provider: {
        exists: (req: Request, cb) => {
            const ext = req.url.split('.').pop();

            if (ext !== 'm3u8' && ext !== 'ts') {
                return cb(null, true);
            }

            fs.access(path.join(current, `../${req.url.replace("output", "output-initial")}`), fs.constants.F_OK, function (err) {
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
            } else {
                const m3u8DataStream = await MinioClient.getFileByPath("kodastream-streams", removeEventsPrefix(req.url.replace("output", "output-initial")));
                const m3u8Data = await streamToString(m3u8DataStream)



                const playlist = HLS.parse(m3u8Data.toString());

                playlist.segments.forEach((segment, i) => {
                    const idFromSegmentFile = segment.uri.split("-")[1]

                    const scene = event.scenes.filter((dbValue) => {
                        return dbValue.id.toString() === idFromSegmentFile
                    });
                    if (scene[0]) {
                        const dateRange = {
                            id: `${uuidv4()}`,
                            classId: `video-${scene[0].id}`,
                            // this date cant be dynamic or safari will break.linux issue?
                            start: new Date("1970-01-01T00:00:00.001Z"),
                            duration: segment.duration,
                            // is this needed at all?
                            // endOnNext: "NO",
                            attributes: { 'X-CUSTOM-KEY': encodeURIComponent(JSON.stringify({ ...JSON.parse(scene[0].metadata), "scene-id": scene[0].id })) }

                            // add iteration so safari picks up new metadata. Should come from db
                        }
                        segment.dateRange = dateRange;
                    }

                });


                const outputPath = path.join(current, `../events/${eventId}/output.m3u8`);
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
            }
        },
        getSegmentStream: async (req: Request, cb) => {
            // Read the file content into memory
            const data = await MinioClient.getFileByPath("kodastream-streams", removeEventsPrefix(req.url));
            const stream = Readable.from(data);
            cb(null, stream);
        }
    }
}

export { app, hlsServerConfig };
