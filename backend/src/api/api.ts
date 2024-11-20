import express, { Request, Response } from 'express';
import cors from 'cors';
import moment from 'moment';
import bodyParser from 'body-parser';
import { start } from '../video-processor';
import { checkIfAttempingEventRestart, checkIfStatusUpdateisValid } from '../helpers/event-validation';
import { createLiveEvent, getLiveEvent, updateLiveEvent, getAllLiveEvents, log, getViewers, getAverageSessionLength } from '../services/db';
import FileStorage from '../services/file-storage';
import { apiResponse } from '../helpers/api-response';

const fileStorage = new FileStorage();

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.get('/status', (req: Request, res: Response) => {
    res.status(200).json(apiResponse(true, 'Service is up'));
});

app.post('/events', async (req: Request, res: Response) => {
    try {
        if (req.headers.accesskey !== process.env.APIKEY) {
            return res.status(403).json(apiResponse(false, 'Access denied'));
        }

        if (!req.body.scenes) {
            return res.status(400).json(apiResponse(false, 'Invalid request: scenes are required'));
        }

        req.body.scenes.forEach((scene, index) => {
            if (scene.metadata && typeof scene.metadata !== 'string') {
                req.body.scenes[index].metadata = JSON.stringify(scene.metadata);
            }
        });

        const event = await createLiveEvent(req.body);
        start(event.id);
        res.status(201).json(apiResponse(true, 'Event created successfully', event));
    } catch (err) {
        console.error('Error in POST /events:', err);
        res.status(500).json(apiResponse(false, 'Internal server error', null, err.message));
    }
});

app.put('/events/:id', async (req: Request, res: Response) => {
    try {
        if (req.headers.accesskey !== process.env.APIKEY) {
            return res.status(403).json(apiResponse(false, 'Access denied'));
        }

        const currentEvent = await getLiveEvent(req.params.id);
        if (!currentEvent) {
            return res.status(404).json(apiResponse(false, 'Event not found'));
        }

        if (!checkIfStatusUpdateisValid(currentEvent.status, req.body.status)) {
            return res.status(400).json(apiResponse(false, 'Invalid stream status update'));
        }

        const updatedEvent = await updateLiveEvent(req.params.id, req.body);
        if (checkIfAttempingEventRestart(currentEvent.status, req.body.status)) {
            start(currentEvent.id);
        }

        res.status(200).json(apiResponse(true, 'Event updated successfully', updatedEvent));
    } catch (err) {
        console.error('Error in PUT /events/:id:', err);
        res.status(500).json(apiResponse(false, 'Internal server error', null, err.message));
    }
});

app.get('/events/:id', async (req: Request, res: Response) => {
    try {
        const event = await getLiveEvent(req.params.id);
        if (!event) {
            return res.status(404).json(apiResponse(false, 'Event not found'));
        }

        res.status(200).json(apiResponse(true, 'Event retrieved successfully', event));
    } catch (err) {
        console.error('Error in GET /events/:id:', err);
        res.status(500).json(apiResponse(false, 'Internal server error', null, err.message));
    }
});

app.get('/events', async (req: Request, res: Response) => {
    try {
        const events = await getAllLiveEvents();

        res.status(200).json(apiResponse(true, 'Events retrieved successfully', events));
    } catch (err) {
        console.error('Error in GET /events:', err);
        res.status(500).json(apiResponse(false, 'Internal server error', null, err.message));
    }
});


app.post('/events/:id/log', async (req: Request, res: Response) => {
    try {
        const { sessionId, type, name, url } = req.body;
        if (!sessionId || !type) {
            return res.status(400).json(apiResponse(false, 'Invalid request: sessionId and type are required'));
        }

        const logEvent = await log(
            moment.utc().format('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]'),
            sessionId,
            req.params.id,
            type,
            name,
            url
        );

        res.status(201).json(apiResponse(true, 'Log event created successfully', logEvent));
    } catch (err) {
        console.error('Error in POST /events/:id/log:', err);
        res.status(500).json(apiResponse(false, 'Internal server error', null, err.message));
    }
});

app.get('/events/:id/analytics', async (req: Request, res: Response) => {
    try {
        // query for totalViewer
        // query for average session length
        const analyticsResult = await getAverageSessionLength(req.params.id);

        const analytics = { totalViewers: analyticsResult.total_visitors, averageSessionLength: analyticsResult.avg_view_length_seconds };
        res.status(200).json(apiResponse(true, 'Analytics retrieved successfully', analytics));
    } catch (err) {
        console.error('Error in GET /events/:id/analytics:', err);
        res.status(500).json(apiResponse(false, 'Internal server error', null, err.message));
    }
});

app.get('/events/:id/views', async (req: Request, res: Response) => {
    try {
        const viewers = await getViewers(req.params.id);
        if (!viewers) {
            return res.status(404).json(apiResponse(false, 'No viewers found'));
        }

        res.status(200).json(apiResponse(true, 'Viewers retrieved successfully', viewers));
    } catch (err) {
        console.error('Error in GET /events/:id/views:', err);
        res.status(500).json(apiResponse(false, 'Internal server error', null, err.message));
    }
});

app.get('/media', async (req: Request, res: Response) => {
    try {
        // const media = [{ id: '1', location: 'example-videos/clip-1.mp4' }, { id: '2', location: 'example-videos/clip-2.mp4' }, { id: '3', location: 'example-videos/short-test.mp4' }, { id: '4', location: '19-09-2024/ferragamo-coffee.mp4' }]
        const media = await fileStorage.listAllFilesInBucket("kodastream-media");
        res.status(200).json(apiResponse(true, 'Media retrieved successfully', media));
    } catch (err) {
        console.error('Error in GET /media:', err);
        res.status(500).json(apiResponse(false, 'Internal server error', null, err.message));
    }
});

export default app;
