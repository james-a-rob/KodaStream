import "reflect-metadata";
import { Request } from 'express';
import fs from 'fs-extra';
import path from 'path';
import { hlsServerConfig } from "../src/content-server";
import AppDataSource from '../src/data-source';
import { createLiveEvent } from '../src/db';
import { StreamStatus } from "../src/enums";

beforeEach(async () => {
    await AppDataSource.initialize();
});

afterEach(async () => {
    await AppDataSource.destroy();
});

const eventWithScenesAndMetadata = {
    url: 'https://streamer.com/output-1234.m3u8',
    loop: true,
    status: StreamStatus.Started,
    scenes: [
        {
            location: 'videos/final_sebastien_stylist_intro.mp4',
            metadata: 'Nike',
        }
    ]
}


describe('content server config', () => {
    test('it adds metadata to m3u8 file', async () => {

        const event = await createLiveEvent(eventWithScenesAndMetadata);
        const locationOfMockVideoContent = path.join(__dirname, `./mock-video-content/short`);
        const locationOfVideoContent = path.join(__dirname, `../src/events/${event.id}`);
        await fs.remove(locationOfVideoContent);
        await fs.ensureDir(locationOfVideoContent);
        await fs.copy(locationOfMockVideoContent, locationOfVideoContent);

        // add m3u8 and ts file in diretory jusing response event id

        const fakeRequest = {
            url: '/events/1/output.m3u8'
        } as Request;
        const cb = (error, stream) => {
            // check arguments
            const outputPath = path.join(__dirname, `../src/events/${event.id}/output.m3u8`);

            expect(error).toBe(null);
            expect(stream.path).toBe(outputPath);

        }
        await hlsServerConfig.provider.getManifestStream(fakeRequest, cb)

    });
});