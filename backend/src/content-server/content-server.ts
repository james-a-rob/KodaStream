import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';
import path from 'path';
import HLS from 'hls-parser';
import { Readable } from 'stream';
import fs from 'fs';
import Logger from '../services/logger';
import { getLiveEvent } from '../services/db';
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
        exists: async (req: Request, cb: (err: Error | null, exists: boolean) => void) => {
            try {
                const ext = path.extname(req.url).slice(1);
                logger.debug('content-server: Checking existence of file', { url: req.url, ext });

                // Allow non-HLS file types without storage check
                if (!['m3u8', 'ts'].includes(ext)) {
                    logger.info('content-server: Non-HLS file, skipping existence check', { url: req.url });
                    return cb(null, true);
                }

                if (!req.url) {
                    logger.error('content-server: Invalid request URL for file check');
                    return cb(new Error('Invalid URL'), false);
                }

                const filePath = removeEventsPrefix(req.url.replace('output', 'output-initial'));
                logger.debug('content-server: Transformed file path for storage check', { filePath });

                // Attempt to retrieve the file
                await fileStorage.getFileByPath('kodastream-streams', filePath);
                logger.info('content-server: File exists in storage', { filePath });

                cb(null, true); // File exists
            } catch (err: any) {
                if (err.code === 'NoSuchKey' || err.message.includes('not found')) {
                    logger.warn('content-server: File not found in storage', { url: req.url, error: err.message });
                    cb(null, false); // File does not exist
                } else {
                    logger.error('content-server: Unexpected error during file check', { url: req.url, error: err.message });
                    cb(err, false); // Propagate unexpected errors
                }
            }
        },
        getManifestStream: async (req: Request, cb) => {
            const eventId = req.url.split("/")[2];
            logger.info('content-server: Fetching manifest stream', { eventId });

            try {
                // Get live event
                let event;
                try {
                    event = await getLiveEvent(eventId);
                    if (!event) {
                        logger.warn('content-server: Event not found', { eventId });
                        return cb(true, null);
                    }
                } catch (err) {
                    logger.error('content-server: Error fetching live event', { eventId, error: err.message });
                    return cb(true, null); // Return if there's an error fetching the event
                }

                // Get the file path from file storage
                let filePath;
                try {
                    filePath = await fileStorage.getFileByPath("kodastream-streams", removeEventsPrefix(req.url.replace("output", "output-initial")));
                } catch (err) {
                    logger.error('content-server: Error fetching file from storage', { eventId, url: req.url, error: err.message });
                    return cb(true, null); // Return if there's an error fetching the file
                }

                // Create a stream for the m3u8 file
                let m3u8DataStream;
                try {
                    m3u8DataStream = fs.createReadStream(filePath);
                } catch (err) {
                    logger.error('content-server: Error reading m3u8 file from disk', { filePath, error: err.message });
                    return cb(true, null); // Return if there's an error reading the file
                }

                // Convert the stream to a string
                let m3u8Data;
                try {
                    m3u8Data = await streamToString(m3u8DataStream);
                } catch (err) {
                    logger.error('content-server: Error converting m3u8 stream to string', { eventId, error: err.message });
                    return cb(true, null); // Return if there's an error converting the stream to a string
                }

                // Check if m3u8 data is empty or undefined
                if (!m3u8Data) {
                    logger.error('content-server: Could not retrieve m3u8 data', { eventId });
                    return cb(true, null); // Return if m3u8Data is empty
                }

                // Parse the m3u8 data into a playlist
                let playlist;
                try {
                    playlist = HLS.parse(m3u8Data);
                } catch (err) {
                    logger.error('content-server: Error parsing m3u8 data', { eventId, error: err.message, m3u8DataLength: m3u8Data.length });
                    return cb(true, null); // Return if there's an error parsing the m3u8 data
                }
                logger.info('content-server: m3u8 file parsed and ready for modification', { eventId });

                // Modify the playlist segments
                try {
                    playlist.segments.forEach((segment) => {
                        const idFromSegmentFile = segment.uri.split("-")[1];
                        const scene = event.scenes.find((dbValue) => dbValue.id.toString() === idFromSegmentFile);

                        if (scene) {
                            let customAttributes = undefined;
                            if (scene.metadata) {
                                customAttributes = {
                                    'X-CUSTOM-KEY': encodeURIComponent(JSON.stringify({
                                        ...JSON.parse(scene.metadata),
                                        "scene-id": scene.id
                                    }))
                                };
                            }

                            segment.dateRange = {
                                id: `${uuidv4()}`,
                                classId: `video-${scene.id}`,
                                start: new Date("1970-01-01T00:00:00.001Z"),
                                duration: segment.duration,
                                attributes: customAttributes
                            };
                        }
                    });
                } catch (err) {
                    logger.error('content-server: Error modifying playlist segments', { eventId, error: err.message });
                    return cb(true, null); // Return if there's an error modifying the segments
                }

                logger.info('content-server: m3u8 successfully modified', { eventId });

                // Stringify the playlist and create a stream
                let newPlaylist;
                try {
                    newPlaylist = HLS.stringify(playlist);
                } catch (err) {
                    logger.error('content-server: Error converting playlist back to string', { eventId, error: err.message });
                    return cb(true, null); // Return if there's an error converting the playlist back to string
                }

                let stream;
                try {
                    stream = Readable.from(newPlaylist);
                } catch (err) {
                    logger.error('content-server: Error creating stream from modified playlist', { eventId, error: err.message });
                    return cb(true, null); // Return if there's an error creating the stream
                }

                logger.info('content-server: Manifest processed successfully', { eventId });

                // Send the final stream
                cb(null, stream);

            } catch (err) {
                logger.error('content-server: Unexpected error while processing manifest stream', { eventId, error: err.message });
                cb(true, null); // Catch all unexpected errors
            }

        },
        getSegmentStream: async (req: Request, cb) => {
            try {
                const filePath = await fileStorage.getFileByPath("kodastream-streams", removeEventsPrefix(req.url));
                const stream = fs.createReadStream(filePath);

                // const stream = Readable.from(data);

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
