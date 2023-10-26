import "reflect-metadata";
import request from 'supertest';
import AppDataSource from '../src/data-source';
import { start } from '../src/video-processor';
import { Event } from "../src/entity/Event";
import { Scene } from "../src/entity/Scene";
import { StreamStatus } from "../src/enums";
import app from '../src/api';


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
    status: StreamStatus.Finished

}

const simpleRestartedEvent = {
    status: StreamStatus.Started

}

const eventWithTwoScenesAndMetadata = {
    scenes: [
        {
            location: 'https://s3.com/videos/1234.mp4',
            metadata: {name: 'Nike'}
        },
        {
            location: 'https://s3.com/videos/5678.mp4',
            metadata: {name: 'Asics'}
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
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json');

            expect(response.headers["content-type"]).toMatch(/json/);

            expect(response.status).toEqual(400);
        });

    });

    describe('update', () => {
        test("replace scenes", async () => {
            const response = await request(app)
                .post('/events')
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
                .send(simpleEvent)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json');

            const response2 = await request(app)
                .put('/events/1')
                .send(simpleStoppedEvent)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json');

            expect(response.body.status).toEqual("started");
            expect(response2.body.status).toEqual("finished");
            expect(start).toHaveBeenCalledTimes(1);


        });

        test("restart event", async () => {
            const response = await request(app)
                .post('/events')
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
            expect(response2.body.status).toEqual("finished");
            expect(response3.body.status).toEqual("started");
            expect(start).toHaveBeenCalledTimes(2);


        });

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

