import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';
import path from 'path';
import HLS from 'hls-parser';
import { Readable } from 'stream';
import fs from 'fs';
import Logger from '../services/logger';
import { getLiveEvent } from '../db';
import FileStorage from '../services/file-storage';
import * as currentPath from "../current-path.cjs";


const fileStorage = new FileStorage();


const current = currentPath.default;
const logger = Logger.getLogger(); // Initialize logger

const app = express();
app.use(cors());

// Log the start of the app
logger.info('content-server: Application started, setting up routes');

app.get('/hls-parser', (req: Request, res: Response) => {
    logger.info('content-server: Serving HLS Parser script', { route: req.url });
    return res.status(200).sendFile(path.join(current, '../public/parser.js'));
});

app.get('/hls', (req: Request, res: Response) => {
    logger.info('content-server: Serving HLS script', { route: req.url });
    return res.status(200).sendFile(path.join(current, '../public/hls.js'));
});

app.get('/koda-player', (req: Request, res: Response) => {
    logger.info('content-server: Serving Koda Player script', { route: req.url });
    return res.status(200).sendFile(path.join(current, '../public/koda-player.js'));
});

app.get('/init.mp4', (req: Request, res: Response) => {
    logger.info('content-server: Serving client HTML for init.mp4', { route: req.url });
    return res.status(200).sendFile(path.join(current, '../public/client.html'));
});

app.get('/ios-demo', (req: Request, res: Response) => {
    logger.info('content-server: Serving iOS demo client HTML', { route: req.url });
    return res.status(200).sendFile(path.join(current, '../public/client-ios.html'));
});

function removeEventsPrefix(filePath: string): string {
    return filePath.replace(/^\/?events\//, '');
}

const streamToString = (stream: Readable): Promise<string> => {
    return new Promise((resolve, reject) => {
        let data = '';

        stream.on('data', (chunk: Buffer) => {
            data += chunk.toString();
        });

        stream.on('end', () => {
            resolve(data);
        });

        stream.on('error', (err) => {
            logger.error('content-server: Error reading stream', { error: err.message });
            reject(err);
        });
    });
};

const hlsServerConfig = {
    provider: {
        exists: async (req: Request, cb) => {
            const ext = req.url.split('.').pop();
            logger.debug('content-server: Checking existence of file', { url: req.url });

            if (ext !== 'm3u8' && ext !== 'ts') {
                return cb(null, true);
            }

            const filePath = removeEventsPrefix(req.url.replace("output", "output-initial"));

            cb(null, true);


            try {
                await fileStorage.getFileByPath("kodastream-streams", filePath);
                logger.info('content-server: File exists in S3', { filePath });
                cb(null, true);
            } catch (e) {
                logger.warn('content-server: File not found in S3', { filePath, error: e.message });
                cb(null, false);
            }
        },
        getManifestStream: async (req: Request, cb) => {
            const eventId = req.url.split("/")[2];
            logger.info('content-server: Fetching manifest stream', { eventId });

            try {
                const event = await getLiveEvent(eventId);

                if (!event) {
                    logger.warn('content-server: Event not found', { eventId });
                    return cb(true, null);
                }


                const m3u8DataStream = await fileStorage.getFileByPath("kodastream-streams", removeEventsPrefix(req.url.replace("output", "output-initial")));
                // const readStream = fs.createReadStream('/Users/jamesrobertson/Code/KodaStream/backend/events/205/output-initial.m3u8');


                logger.info('content-server: Initial m3u8 file pulled from storage', { eventId });
                const m3u8Data = await streamToString(m3u8DataStream);
                logger.info('content-server: m3u8 file converted to string', { eventId });

                const playlist = HLS.parse(m3u8Data);
                logger.info('content-server: m3u8 file parsed and ready for modification', { eventId });

                playlist.segments.forEach((segment) => {
                    const idFromSegmentFile = segment.uri.split("-")[1];
                    const scene = event.scenes.find((dbValue) => dbValue.id.toString() === idFromSegmentFile);

                    if (scene) {
                        segment.dateRange = {
                            id: `${uuidv4()}`,
                            classId: `video-${scene.id}`,
                            start: new Date("1970-01-01T00:00:00.001Z"),
                            duration: segment.duration,
                            attributes: {
                                'X-CUSTOM-KEY': encodeURIComponent(JSON.stringify({
                                    ...JSON.parse(scene.metadata),
                                    "scene-id": scene.id
                                }))
                            }
                        };
                    }
                });

                logger.info('content-server: m3u8 successfully modified', { eventId });

                const newPlaylist = HLS.stringify(playlist);
                const stream = Readable.from(newPlaylist);

                logger.info('content-server: Manifest processed successfully', { eventId });
                console.log('stream', stream)
                console.log('m3u8DataStream', m3u8DataStream)

                cb(null, stream);
                // cb(null, readStream)
                // cb(null, m3u8DataStream);

            } catch (err) {
                logger.error('content-server: Error processing manifest', { eventId, error: err });
                cb(true, null);
            }
        },
        getSegmentStream: async (req: Request, cb) => {
            // cb(true, null)
            try {
                const data = await fileStorage.getFileByPath("kodastream-streams", removeEventsPrefix(req.url));
                const stream = Readable.from(data);
                const readStream = fs.createReadStream(`/Users/jamesrobertson/Code/KodaStream/backend${req.url}`);

                logger.info('content-server: Segment stream fetched successfully', { url: req.url });
                // cb(null, readStream);

                cb(null, stream);
            } catch (err) {
                logger.error('content-server: Error fetching segment stream', { url: req.url, error: err.message });
                cb(true, null);
            }
        }
    }
};

export { app, hlsServerConfig };
