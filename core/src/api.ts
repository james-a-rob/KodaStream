import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { start } from './video-processor';
import { StreamStatus } from './enums';
import { createLiveEvent, getLiveEvent, updateLiveEvent } from './db';

const app = express();
app.use(bodyParser.json())

app.post("/events", async (req: Request, res: Response) => {
    if (!req.body.scenes) {
        return res.status(400).json({})
    }

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

export default app;