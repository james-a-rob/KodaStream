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
import cors from 'cors';
import moment from 'moment';
import bodyParser from 'body-parser';
import { start } from './video-processor';
import { checkIfAttempingEventRestart, checkIfStatusUpdateisValid } from './helpers/event-validation';
import { createLiveEvent, getLiveEvent, updateLiveEvent, log, getViewers } from './db';
const app = express();
app.use(bodyParser.json());
app.use(cors());
app.get('/status', (req, res) => {
    res.status(200).send({ status: 'UP' });
});
app.post("/events", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.headers.accesskey !== process.env.APIKEY) {
            return res.status(403).json({ error: 'Access denied' });
        }
        if (!req.body.scenes) {
            return res.status(400).json({ error: 'Invalid request' });
        }
        req.body.scenes.forEach((scene, index) => {
            if (scene.metadata && typeof scene.metadata !== "string") {
                const stringMetadata = JSON.stringify(scene.metadata);
                req.body.scenes[index].metadata = stringMetadata;
            }
        });
        const event = yield createLiveEvent(req.body);
        start(event.id); // Ensure status is started
        res.json(event);
    }
    catch (err) {
        console.error('Error in POST /events:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
app.put("/events/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.headers.accesskey !== process.env.APIKEY) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const currentEvent = yield getLiveEvent(req.params.id);
        if (!currentEvent) {
            return res.status(404).json({ error: 'Event not found' });
        }
        const updatedEvents = yield updateLiveEvent(req.params.id, req.body);
        const statusUpdateisValid = checkIfStatusUpdateisValid(currentEvent.status, req.body.status);
        if (!statusUpdateisValid) {
            return res.status(400).send("Not possible to update event. Invalid stream status sent");
        }
        const shouldRestart = checkIfAttempingEventRestart(currentEvent.status, req.body.status);
        if (shouldRestart) {
            start(currentEvent.id);
        }
        res.setHeader('Content-Type', 'application/json');
        res.send(updatedEvents);
    }
    catch (err) {
        console.error('Error in PUT /events/:id:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
app.get("/events/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const event = yield getLiveEvent(req.params.id);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.setHeader('Content-Type', 'application/json');
        res.send(event);
    }
    catch (err) {
        console.error('Error in GET /events/:id:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
app.post("/events/:id/log", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.body.sessionId) {
            return res.status(400).json({ error: 'Invalid request' });
        }
        if (!req.body.type) {
            return res.status(400).json({ error: 'Invalid request. No type' });
        }
        const utcMoment = moment.utc();
        const logEvent = yield log(utcMoment.format('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]'), req.body.sessionId, req.params.id, req.body.type, req.body.name, req.body.url);
        res.setHeader(`Access-Control-Allow-Origin`, `*`);
        res.setHeader(`Access-Control-Allow-Methods`, `GET,PUT,POST,DELETE`);
        res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
        res.setHeader('Content-Type', 'application/json');
        res.send(logEvent);
    }
    catch (err) {
        console.error('Error in POST /events/:id/log:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
app.get("/events/:id/views", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const viewers = yield getViewers(req.params.id);
        if (!viewers) {
            return res.status(404).json({ error: 'Viewers not found' });
        }
        res.setHeader(`Access-Control-Allow-Origin`, `*`);
        res.setHeader(`Access-Control-Allow-Methods`, `GET,PUT,POST,DELETE`);
        res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
        res.setHeader('Content-Type', 'application/json');
        res.send(viewers);
    }
    catch (err) {
        console.error('Error in GET /events/:id/views:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
app.post("/videos", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Add your video endpoint logic here (if required)
    res.status(501).json({ error: 'Not implemented' });
}));
export default app;
//# sourceMappingURL=api.js.map