import express, { Request, Response } from 'express';
import cors from 'cors';
import moment from 'moment';
import bodyParser from 'body-parser';
import { start } from './video-processor';
import { StreamStatus } from './enums';
import { createLiveEvent, getLiveEvent, updateLiveEvent, logViewer, getViewers } from './db';

const app = express();
app.use(bodyParser.json())
app.use(cors());

app.post("/events", async (req: Request, res: Response) => {

    if (req.headers.accesskey !== 'dh2873hd8qwegiuf873wgf783w4') {
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
    const currentEvent = await getLiveEvent(req.params.id);
    const updatedEvents = await updateLiveEvent(req.params.id, req.body);

    const shouldRestart = currentEvent.status === StreamStatus.Finished && req.body.status === StreamStatus.Started;
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

app.post("/events/:id/views", async (req: Request, res: Response) => {
    if (!req.body.sessionId) {
        return res.status(400).json({ error: 'Invalid request' })
    }

    const utcMoment = moment.utc();

    const viewer = await logViewer(utcMoment.format('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]'), req.body.sessionId, req.params.id);
    res.setHeader(`Access-Control-Allow-Origin`, `*`);
    res.setHeader(`Access-Control-Allow-Methods`, `GET,PUT,POST,DELETE`);
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    res.setHeader('Content-Type', 'application/json');
    res.send(viewer);

});

app.get("/events/:id/views", async (req: Request, res: Response) => {
    const viewers = await getViewers(req.params.id);
    res.setHeader(`Access-Control-Allow-Origin`, `*`);
    res.setHeader(`Access-Control-Allow-Methods`, `GET,PUT,POST,DELETE`);
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    res.setHeader('Content-Type', 'application/json');
    res.send(viewers);

});

export default app;