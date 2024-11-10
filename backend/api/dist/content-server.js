var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';
import fs from 'fs-extra';
import path from 'path';
import HLS from 'hls-parser';
import { getLiveEvent } from './db';
import * as currentPath from "./current-path.cjs";
const current = currentPath.default;
const app = express();
app.use(cors());
app.get('/', (req, res) => {
    return res.status(200).sendFile(path.join(current, '../public/client.html'));
});
app.get('/video-js', (req, res) => {
    return res.status(200).sendFile(path.join(current, '../public/client-video-js.html'));
});
app.get('/video-js-file', (req, res) => {
    return res.status(200).sendFile(path.join(current, '../public/video-js.js'));
});
app.get('/hls-parser', (req, res) => {
    return res.status(200).sendFile(path.join(current, '../public/parser.js'));
});
app.get('/hls', (req, res) => {
    return res.status(200).sendFile(path.join(current, '../public/hls.js'));
});
app.get('/koda-player', (req, res) => {
    return res.status(200).sendFile(path.join(current, '../public/koda-player.js'));
});
app.get('/init.mp4', (req, res) => {
    return res.status(200).sendFile(path.join(current, '../public/client.html'));
});
app.get('/ios-demo', (req, res) => {
    return res.status(200).sendFile(path.join(current, '../public/client-ios.html'));
});
const hlsServerConfig = {
    provider: {
        exists: (req, cb) => {
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
        getManifestStream: (req, cb) => __awaiter(void 0, void 0, void 0, function* () {
            //remove sync calls
            const eventId = req.url.split("/")[2];
            const event = yield getLiveEvent(eventId);
            if (!event) {
                return cb(true, null);
            }
            else {
                const m3u8Data = fs.readFileSync(path.join(current, `../${req.url.replace("output", "output-initial")}`));
                const playlist = HLS.parse(m3u8Data.toString());
                playlist.segments.forEach((segment, i) => {
                    const idFromSegmentFile = segment.uri.split("-")[1];
                    const scene = event.scenes.filter((dbValue) => {
                        return dbValue.id.toString() === idFromSegmentFile;
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
                            attributes: { 'X-CUSTOM-KEY': encodeURIComponent(JSON.stringify(Object.assign(Object.assign({}, JSON.parse(scene[0].metadata)), { "scene-id": scene[0].id }))) }
                            // add iteration so safari picks up new metadata. Should come from db
                        };
                        segment.dateRange = dateRange;
                    }
                });
                const outputPath = path.join(current, `../events/${eventId}/output.m3u8`);
                try {
                    fs.writeFileSync(outputPath, HLS.stringify(playlist));
                }
                catch (e) {
                    console.log("write failed", e);
                }
                let stream;
                try {
                    stream = yield fs.createReadStream(outputPath);
                }
                catch (e) {
                    console.log("read failed");
                }
                cb(null, stream);
            }
        }),
        getSegmentStream: (req, cb) => {
            console.log(req.url);
            const stream = fs.createReadStream(path.join(current, `../${req.url}`));
            cb(null, stream);
        }
    }
};
export { app, hlsServerConfig };
//# sourceMappingURL=content-server.js.map