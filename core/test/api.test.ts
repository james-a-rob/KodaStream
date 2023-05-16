import "reflect-metadata";
import request from 'supertest';
import AppDataSource from '../src/data-source';

import { StreamStatus } from "../src/enums";
import app from '../src/api';

const inputEvent = {
    url: 'https://streamer.com/output-1234.m3u8',
    status: StreamStatus.Started,
    scenes: [
        {
            url: 'https://s3.com/videos/1234.mp4'
        }
    ]
}

beforeEach(async () => {
    await AppDataSource.initialize();
});

afterEach(async () => {
    await AppDataSource.destroy();
});


describe("live streaming", () => {
    test("can create a live stream", async () => {
        const response = await request(app)
            .post('/1234')
            .send(inputEvent)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');

        expect(response.headers["content-type"]).toMatch(/json/);

        expect(response.status).toEqual(200);
        expect(response.body.url).toEqual('https://streamer.com/output-1234.m3u8');
    });

    test("can retreive an already created live stream", async () => {
        await request(app)
            .post('/1234')
            .send(inputEvent)
            .set('Content-Type', 'application/json')

            .set('Accept', 'application/json');

        const response = await request(app)
            .get('/1234')
            .set('Accept', 'application/json');

        expect(response.headers["content-type"]).toMatch(/json/);

        expect(response.status).toEqual(200);
        expect(response.body.url).toEqual('https://streamer.com/output-1234.m3u8');
    });

});

