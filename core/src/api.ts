import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { start } from './video-processor';
import { createLiveEvent, getLiveEvent, updateLiveEvent } from './db';

const app = express();
app.use(bodyParser.json())

app.post("/event", async (req: Request, res: Response) => {
    if (!req.body.url || !req.body.status || !req.body.scenes) {
        return res.status(400).json({})
    }
    const event = await createLiveEvent(req.body);
    // ensure status is started
    start(event.id);
    res.json(event);

});

app.put("/event/:id", async (req: Request, res: Response) => {
    const event = await updateLiveEvent(req.params.id, req.body);
    //if switching from finished to started the call start again
    res.setHeader('Content-Type', 'application/json');
    res.send(event);

});

app.get("/event/:id", async (req: Request, res: Response) => {
    const event = await getLiveEvent(req.params.id);

    res.setHeader('Content-Type', 'application/json');
    res.send(event);

});

export default app;