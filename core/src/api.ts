import express from 'express';
import { createLiveEvent, getLiveEvent } from './db';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json())

app.post("/:id", async (req, res) => {
    const event = await createLiveEvent(req.body);
    res.setHeader('Content-Type', 'application/json');
    res.send(event);

});

app.get("/:id", async (req, res) => {
    const event = await getLiveEvent(req.params.id);

    res.setHeader('Content-Type', 'application/json');
    res.send(event);

});

export default app;