import "reflect-metadata";
import request from 'supertest';
import moment from 'moment';
import AppDataSource from '../src/data-source';
import { start } from '../src/video-processor';
import { Event } from "../src/entity/Event";
import { Scene } from "../src/entity/Scene";
import { Log } from "../src/entity/Log";
import { StreamStatus, LogType } from "../src/enums";
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
                .set('accesskey', 'dh2873hd8qwegiuf873wgf783w4')
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
                .set('accesskey', 'dh2873hd8qwegiuf873wgf783w4')
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
                .set('accesskey', 'dh2873hd8qwegiuf873wgf783w4')
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
                .set('accesskey', 'dh2873hd8qwegiuf873wgf783w4')
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')

            expect(response.headers["content-type"]).toMatch(/json/);

            expect(response.status).toEqual(400);
        });

    });

    describe('update', () => {
        test("replace scenes", async () => {
            const response = await request(app)
                .post('/events')
                .set('accesskey', 'dh2873hd8qwegiuf873wgf783w4')
                .send(simpleEvent)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json');

            const response2 = await request(app)
                .put('/events/1')
                .set('accesskey', 'dh2873hd8qwegiuf873wgf783w4')
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
                .set('accesskey', 'dh2873hd8qwegiuf873wgf783w4')
                .send(simpleEvent)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json');

            const response2 = await request(app)
                .put('/events/1')
                .set('accesskey', 'dh2873hd8qwegiuf873wgf783w4')
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
                .set('accesskey', 'dh2873hd8qwegiuf873wgf783w4')
                .send(simpleEvent)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json');

            const response2 = await request(app)
                .put('/events/1')
                .set('accesskey', 'dh2873hd8qwegiuf873wgf783w4')
                .send(simpleStoppedEvent)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json');

            const response3 = await request(app)
                .put('/events/1')
                .set('accesskey', 'dh2873hd8qwegiuf873wgf783w4')
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
                .set('accesskey', 'dh2873hd8qwegiuf873wgf783w4')
                .send({ status: 'started', ...simpleEvent })
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json');

            const responseStart2 = await request(app)
                .put('/events/1')
                .set('accesskey', 'dh2873hd8qwegiuf873wgf783w4')

                .send({ status: 'started', ...simpleEvent })
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json');

            expect(responseStart2.status).toEqual(400)
            expect(responseStart2.text).toEqual("Not possible to update event. Invalid stream status sent");
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


describe("analytics", () => {
    it('create a log event of type view', async () => {
        const logRepository = AppDataSource.getRepository(Log);

        const singleSecond = 1000;
        const time1MinAgo = Date.now() - (singleSecond * 60);
        moment.now = function () {
            return time1MinAgo;
        }
        const simpleViewData = {
            sessionId: 'abc',
            type: LogType.View,
            name: 'special-name'
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
            .post('/events/1/log')
            .set('accesskey', 'dh2873hd8qwegiuf873wgf783w4')
            .send(simpleViewData)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');

        const allLogs = await logRepository.find();

        expect(response.status).toEqual(200);
        expect(response.body.id).toEqual(1);
        expect(response.body.sessionId).toEqual('abc');
        expect(response.body.name).toEqual('special-name');

        expect(allLogs.length).toBe(1);
        expect(moment(response.body.datetime).format('x')).toEqual(time1MinAgo.toString());
    })

    it('create a log event of type click', async () => {
        const logRepository = AppDataSource.getRepository(Log);

        const singleSecond = 1000;
        const time1MinAgo = Date.now() - (singleSecond * 60);
        moment.now = function () {
            return time1MinAgo;
        }
        const simpleViewData = {
            sessionId: 'abc',
            type: LogType.Click,
            name: 'special-name-click',
            url: 'https://link-that-is-clicked.com'
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
            .post('/events/1/log')
            .set('accesskey', 'dh2873hd8qwegiuf873wgf783w4')
            .send(simpleViewData)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');

        const allLogs = await logRepository.find();

        expect(response.status).toEqual(200);
        expect(response.body.id).toEqual(1);
        expect(response.body.sessionId).toEqual('abc');
        expect(response.body.name).toEqual('special-name-click');
        expect(response.body.url).toEqual('https://link-that-is-clicked.com');


        expect(allLogs.length).toBe(1);
        expect(moment(response.body.datetime).format('x')).toEqual(time1MinAgo.toString());
    })

    it('lists current viewers for an event', async () => {
        // set time 1 min in past
        const singleSecond = 1000;
        const time1MinAgo = Date.now() - (singleSecond * 60);
        const time2MinAgo = Date.now() - (singleSecond * (60 * 2));
        const time61MinAgo = Date.now() - (singleSecond * (60 * 61));

        const eventRepository = AppDataSource.getRepository(Event);
        const logRepository = AppDataSource.getRepository(Log);

        const sceneOne = new Scene();
        sceneOne.location = "https://s3.com/videos/1234.mp4";

        const event = new Event();
        event.url = 'https://streamer.com/output-1234.m3u8';
        event.status = StreamStatus.Started;
        event.scenes = [sceneOne];
        await eventRepository.save(event);

        const log1 = new Log();
        log1.datetime = moment.utc(time1MinAgo).format();
        log1.sessionId = "1";
        log1.type = LogType.View;
        log1.event = event;
        await logRepository.save(log1)

        const log2 = new Log();
        log2.datetime = moment.utc(time2MinAgo).format();
        log2.sessionId = "2";
        log2.type = LogType.View;
        log2.event = event;
        await logRepository.save(log2)


        const log3 = new Log();
        log3.datetime = moment.utc(time61MinAgo).format();
        log3.sessionId = "3";
        log3.type = LogType.View;
        log3.event = event;
        await logRepository.save(log3)

        const log4 = new Log();
        log4.datetime = moment.utc(time2MinAgo).format();
        log4.sessionId = "1";
        log4.type = LogType.View;
        log4.event = event;
        await logRepository.save(log4)

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

