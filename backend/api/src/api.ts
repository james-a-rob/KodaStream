import express, { Request, Response } from 'express';
import cors from 'cors';
import moment from 'moment';
import bodyParser from 'body-parser';
import { start } from './video-processor';
import { checkIfAttempingEventRestart, checkIfStatusUpdateisValid } from './helpers/event-validation';
import { createLiveEvent, getLiveEvent, updateLiveEvent, log, getViewers } from './db';

const app = express();
app.use(bodyParser.json())
app.use(cors());

app.post("/events", async (req: Request, res: Response) => {
    if (req.headers.accesskey !== process.env.APIKEY) {
        return res.status(403).json({ error: 'Access denied' })
    }


    if (!req.body.scenes) {
        return res.status(400).json({ error: 'Invalid request' })
    }

    req.body.scenes.forEach((scene, index) => {
        if (scene.metadata && typeof scene.metadata !== "string") {
            const stringMetadata = JSON.stringify(scene.metadata);
            req.body.scenes[index].metadata = stringMetadata;
        }
    });


    const event = await createLiveEvent(req.body);
    // ensure status is started
    start(event.id);
    res.json(event);

});

app.put("/events/:id", async (req: Request, res: Response) => {
    if (req.headers.accesskey !== process.env.APIKEY) {
        return res.status(403).json({ error: 'Access denied' })
    }

    const currentEvent = await getLiveEvent(req.params.id);
    //check current state vs target state before any update.
    const updatedEvents = await updateLiveEvent(req.params.id, req.body);

    const statusUpdateisValid = checkIfStatusUpdateisValid(currentEvent.status, req.body.status)
    if (!statusUpdateisValid) {
        return res.status(400).send("not possible to update event. Invalid stream status sent")
    }
    const shouldRestart = checkIfAttempingEventRestart(currentEvent.status, req.body.status);
    if (shouldRestart) {
        start(currentEvent.id);
    }
    res.setHeader('Content-Type', 'application/json');
    res.send(updatedEvents);

});

app.get("/events/:id", async (req: Request, res: Response) => {
    const event = await getLiveEvent(req.params.id);

    res.setHeader('Content-Type', 'application/json');
    res.send(event);

});

app.post("/events/:id/log", async (req: Request, res: Response) => {
    if (!req.body.sessionId) {
        return res.status(400).json({ error: 'Invalid request' })
    }

    if (!req.body.type) {
        return res.status(400).json({ error: 'Invalid request. No type' })
    }

    const utcMoment = moment.utc();

    const logEvent = await log(utcMoment.format('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]'), req.body.sessionId, req.params.id, req.body.type, req.body.name, req.body.url);
    res.setHeader(`Access-Control-Allow-Origin`, `*`);
    res.setHeader(`Access-Control-Allow-Methods`, `GET,PUT,POST,DELETE`);
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    res.setHeader('Content-Type', 'application/json');
    res.send(logEvent);

});

app.get("/events/:id/views", async (req: Request, res: Response) => {
    const viewers = await getViewers(req.params.id);
    res.setHeader(`Access-Control-Allow-Origin`, `*`);
    res.setHeader(`Access-Control-Allow-Methods`, `GET,PUT,POST,DELETE`);
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    res.setHeader('Content-Type', 'application/json');
    res.send(viewers);

});

app.post("/videos", () => { });

export default app;