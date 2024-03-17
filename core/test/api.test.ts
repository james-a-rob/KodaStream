import "reflect-metadata";
import request from 'supertest';
import moment from 'moment';
import AppDataSource from '../src/data-source';
import { start } from '../src/video-processor';
import { Event } from "../src/entity/Event";
import { Scene } from "../src/entity/Scene";
import { Viewer } from "../src/entity/Viewer";
import { StreamStatus } from "../src/enums";
import app from '../src/api';
import { describe } from "node:test";


jest.mock('../src/video-processor', () => ({
    start: jest.fn()
}));

const simpleEvent = {
    scenes: [
        {
            location: 'https://s3.com/videos/1234.mp4'
        }
    ]
}

const simpleStoppedEvent = {
    status: StreamStatus.Stopped

}

const simpleRestartedEvent = {
    status: StreamStatus.Started

}

const eventWithTwoScenesAndMetadata = {
    scenes: [
        {
            location: 'https://s3.com/videos/1234.mp4',
            metadata: { name: 'Nike' }
        },
        {
            location: 'https://s3.com/videos/5678.mp4',
            metadata: { name: 'Asics' }
        }
    ]
}

const newScenes = {
    scenes: [
        {
            location: 'https://s3.com/videos/5678.mp4'
        },
        {
            location: 'https://s3.com/videos/abcd.mp4'
        }
    ]
}

const simpleLoopedEvent = {
    loop: true,
    scenes: [
        {
            location: 'https://s3.com/videos/1234.mp4'
        }
    ]
}

beforeEach(async () => {
    await AppDataSource.initialize();
});

afterEach(async () => {
    await AppDataSource.destroy();
    jest.clearAllMocks();

});


describe("live streaming", () => {
    describe('create', () => {
        test("can create a simple live event that starts imediatly", async () => {
            const response = await request(app)
                .post('/events')
                .set('accessKey', 'dh2873hd8qwegiuf873wgf783w4')
                .send(simpleEvent)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json');

            expect(response.headers["content-type"]).toMatch(/json/);

            expect(response.status).toEqual(200);
            expect(response.body.url).toEqual(`/events/${response.body.id}/output.m3u8`);
            expect(start).toHaveBeenCalledTimes(1);
            expect(response.body.scenes).toEqual([
                {
                    id: 1,
                    location: 'https://s3.com/videos/1234.mp4',
                    metadata: ''
                }
            ]);
        });

        test("create stream with loop enabled", async () => {
            const response = await request(app)
                .post('/events')
                .set('accessKey', 'dh2873hd8qwegiuf873wgf783w4')
                .send(simpleLoopedEvent)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json');

            expect(response.headers["content-type"]).toMatch(/json/);

            expect(response.status).toEqual(200);
            expect(response.body.url).toEqual(`/events/${response.body.id}/output.m3u8`);
            expect(response.body.loop).toBe(true);
            expect(response.body.scenes).toEqual([
                {
                    id: 1,
                    location: 'https://s3.com/videos/1234.mp4',
                    metadata: ''
                }
            ]);
        });

        test('create a stream with multiple scenes with their own metadata', async () => {
            const response = await request(app)
                .post('/events')
                .set('accessKey', 'dh2873hd8qwegiuf873wgf783w4')
                .send(eventWithTwoScenesAndMetadata)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json');

            expect(response.headers["content-type"]).toMatch(/json/);

            expect(response.body.scenes).toEqual([
                {
                    id: 1,
                    location: 'https://s3.com/videos/1234.mp4',
                    metadata: "{\"name\":\"Nike\"}"
                },
                {
                    id: 2,
                    location: 'https://s3.com/videos/5678.mp4',
                    metadata: "{\"name\":\"Asics\"}"
                }
            ]);
        });

        test("create handle no data sent", async () => {
            const response = await request(app)
                .post('/events')
                .set('accessKey', 'dh2873hd8qwegiuf873wgf783w4')
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .set('accessKey', 'dh2873hd8qwegiuf873wgf783w4')

            expect(response.headers["content-type"]).toMatch(/json/);

            expect(response.status).toEqual(400);
        });

    });

    describe('update', () => {
        test("replace scenes", async () => {
            const response = await request(app)
                .post('/events')
                .set('accessKey', 'dh2873hd8qwegiuf873wgf783w4')
                .send(simpleEvent)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json');

            const response2 = await request(app)
                .put('/events/1')
                .send(newScenes)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json');

            expect(response.body.scenes).toEqual([
                {
                    id: 1,
                    location: 'https://s3.com/videos/1234.mp4',
                    metadata: ''
                }
            ]);
            expect(response2.body.scenes).toEqual([
                {
                    id: 2,
                    location: 'https://s3.com/videos/5678.mp4',
                    metadata: ''
                },
                {
                    id: 3,
                    location: 'https://s3.com/videos/abcd.mp4',
                    metadata: ''
                }
            ]);
        });

        test("stop event", async () => {
            const response = await request(app)
                .post('/events')
                .set('accessKey', 'dh2873hd8qwegiuf873wgf783w4')
                .send(simpleEvent)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json');

            const response2 = await request(app)
                .put('/events/1')
                .send(simpleStoppedEvent)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json');

            expect(response.body.status).toEqual("started");
            expect(response2.body.status).toEqual("stopped");
            expect(start).toHaveBeenCalledTimes(1);


        });

        test("restart event", async () => {
            const response = await request(app)
                .post('/events')
                .set('accessKey', 'dh2873hd8qwegiuf873wgf783w4')
                .send(simpleEvent)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json');

            const response2 = await request(app)
                .put('/events/1')
                .send(simpleStoppedEvent)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json');

            const response3 = await request(app)
                .put('/events/1')
                .send(simpleRestartedEvent)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json');


            expect(response.body.status).toEqual("started");
            expect(response2.body.status).toEqual("stopped");
            expect(response3.body.status).toEqual("started");
            expect(start).toHaveBeenCalledTimes(2);


        });

        test("starting an already started stream", async () => {
            const responseStart1 = await request(app)
                .post('/events')
                .set('accessKey', 'dh2873hd8qwegiuf873wgf783w4')
                .send({ status: 'started', ...simpleEvent })
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json');

            const responseStart2 = await request(app)
                .put('/events/1')
                .send({ status: 'started', ...simpleEvent })
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json');

            expect(responseStart2.status).toEqual(400)
            expect(responseStart2.text).toEqual("not possible to update event. Invalid stream status sent");
        })

    })

    describe('get', () => {
        test("can retreive an already created live stream", async () => {
            const eventRepository = AppDataSource.getRepository(Event);
            const sceneOne = new Scene();
            sceneOne.location = "https://s3.com/videos/1234.mp4";

            const event = new Event();

            event.url = 'https://streamer.com/output-1234.m3u8';

            event.status = StreamStatus.Started;

            event.scenes = [sceneOne];

            await eventRepository.save(event);

            const response = await request(app)
                .get('/events/1')
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json');

            expect(response.headers["content-type"]).toMatch(/json/);

            expect(response.status).toEqual(200);
            expect(response.body.url).toEqual('https://streamer.com/output-1234.m3u8');

            expect(response.body.scenes).toEqual([
                {
                    id: 1,
                    location: 'https://s3.com/videos/1234.mp4',
                    metadata: ''
                }
            ]);
        });
    });
});


describe("live stream view counter", () => {
    it('adds or udpates viewers of event', async () => {
        const viewerRepository = AppDataSource.getRepository(Viewer);

        const singleSecond = 1000;
        const time1MinAgo = Date.now() - (singleSecond * 60);
        moment.now = function () {
            return time1MinAgo;
        }
        const simpleViewData = {
            sessionId: 'abc'

        }

        const eventRepository = AppDataSource.getRepository(Event);
        const sceneOne = new Scene();
        sceneOne.location = "https://s3.com/videos/1234.mp4";

        const event = new Event();
        event.url = 'https://streamer.com/output-1234.m3u8';
        event.status = StreamStatus.Started;
        event.scenes = [sceneOne];
        await eventRepository.save(event);

        const response = await request(app)
            .post('/events/1/views')
            .set('accessKey', 'dh2873hd8qwegiuf873wgf783w4')
            .send(simpleViewData)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');

        const response2 = await request(app)
            .post('/events/1/views')
            .set('accessKey', 'dh2873hd8qwegiuf873wgf783w4')
            .send(simpleViewData)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');

        const allViewers = await viewerRepository.find();

        expect(response.status).toEqual(200);
        expect(response.body.id).toEqual(1);
        expect(response.body.sessionId).toEqual('abc');
        expect(allViewers.length).toBe(1);
        expect(moment(response.body.datetime).format('x')).toEqual(time1MinAgo.toString());
    })

    it('lists current viewers for an event', async () => {
        // set time 1 min in past
        const singleSecond = 1000;
        const time1MinAgo = Date.now() - (singleSecond * 60);
        const time2MinAgo = Date.now() - (singleSecond * (60 * 2));
        const time61MinAgo = Date.now() - (singleSecond * (60 * 61));

        const eventRepository = AppDataSource.getRepository(Event);
        const viewerRepository = AppDataSource.getRepository(Viewer);

        const sceneOne = new Scene();
        sceneOne.location = "https://s3.com/videos/1234.mp4";

        const event = new Event();
        event.url = 'https://streamer.com/output-1234.m3u8';
        event.status = StreamStatus.Started;
        event.scenes = [sceneOne];
        await eventRepository.save(event);

        const viewer1 = new Viewer();
        viewer1.datetime = moment.utc(time1MinAgo).format();
        viewer1.sessionId = "1";
        viewer1.event = event;
        await viewerRepository.save(viewer1)

        const viewer2 = new Viewer();
        viewer2.datetime = moment.utc(time2MinAgo).format();
        viewer2.sessionId = "2";
        viewer2.event = event;
        await viewerRepository.save(viewer2)

        const viewer3 = new Viewer();
        viewer3.datetime = moment.utc(time61MinAgo).format();
        viewer3.sessionId = "3";
        viewer3.event = event;
        await viewerRepository.save(viewer3)

        const response = await request(app)
            .get('/events/1/views')
            .send()
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');

        expect(response.status).toEqual(200);
        expect(response.body.currentViewers).toEqual(2);


    })
});

describe("video on demand", () => {

});

