import "reflect-metadata";
import HLS from 'hls-parser';

import { Request } from 'express';
import fs from 'fs-extra';
import path from 'path';
import { hlsServerConfig } from "../src/content-server/content-server";
import AppDataSource from '../src/data-source';
import { createLiveEvent } from '../src/db';
import { StreamStatus } from "../src/enums";
import FileStorage from "../src/services/file-storage";

beforeEach(async () => {
    await AppDataSource.initialize();
});

afterEach(async () => {
    await AppDataSource.destroy();
});

afterAll(() => {
    fs.emptyDirSync(path.join(__dirname, `../events/1`));

})

async function waitForFileExists(filePath, currentTime = 0, timeout = 20000) {
    if (fs.existsSync(filePath)) return true;
    if (currentTime === timeout) return false;
    // wait for 1 second
    await new Promise((resolve, reject) => setTimeout(() => resolve(true), 1000));
    // waited for 1 second
    return waitForFileExists(filePath, currentTime + 1000, timeout);
}

const eventWithScenesAndMetadata = {
    url: 'https://streamer.com/output-1234.m3u8',
    loop: false,
    status: StreamStatus.Started,
    scenes: [
        {
            location: 'videos/test-vids/short-test.mp4',
            metadata: "{\"name\":\"Nike\"}",
        }
    ]
}


describe('content server config', () => {
    test('it adds metadata to m3u8 file', async () => {

        const event = await createLiveEvent(eventWithScenesAndMetadata);

        const locationOfMockVideoContent = path.join(__dirname, `./mock-video-content/short`);
        const locationOfVideoContent = `${event.id}`;

        await FileStorage.uploadFile('kodastream-streams', `${locationOfMockVideoContent}/output-initial.m3u8`, `${locationOfVideoContent}/output-initial.m3u8`);



        // add m3u8 and ts file in diretory jusing response event id
        const outputPath = path.join(__dirname, `../events/${event.id}/output.m3u8`);

        const fakeRequest = {
            url: '/events/1/output.m3u8'
        } as Request;

        const cb = async (error, stream) => {
            console.log('stream', stream.toString())
            let m3u8Data = '';
            stream.on('data', (chunk) => {
                m3u8Data += chunk.toString();
            });
            stream.on('end', () => {
                const playlist = HLS.parse(m3u8Data.toString());
                const expectedMetadata = encodeURIComponent(JSON.stringify({
                    "name": "Nike",
                    "scene-id": event.scenes[0].id
                }));
                expect(playlist.source.includes(expectedMetadata)).toBe(true);
                expect(error).toBe(null);
            });

        }
        waitForFileExists(outputPath)
        await hlsServerConfig.provider.getManifestStream(fakeRequest, cb);


    });

    test('handles request for event that does not exist', async () => {

        const fakeRequest = {
            url: '/events/1/output.m3u8'
        } as Request;
        const cb = async (error, stream) => {
            // check arguments
            expect(error).toBe(true);

        }
        await hlsServerConfig.provider.getManifestStream(fakeRequest, cb);


    });

    xtest('it serves large m3u8 files in a reasonable time', async () => {
        const event = await createLiveEvent(eventWithScenesAndMetadata);
        const locationOfMockVideoContent = path.join(__dirname, `./mock-video-content/large-playlist`);
        const locationOfVideoContent = path.join(__dirname, `../events/${event.id}`);
        fs.rmSync(locationOfVideoContent, { recursive: true, force: true });
        fs.ensureDirSync(locationOfVideoContent);
        fs.copySync(locationOfMockVideoContent, locationOfVideoContent);

        // add m3u8 and ts file in diretory jusing response event id

        const fakeRequest = {
            url: '/events/1/output.m3u8'
        } as Request;
        const cb = (error, stream) => {
            // check arguments
            const outputPath = path.join(__dirname, `../events/${event.id}/output.m3u8`);

            expect(error).toBe(null);
            expect(stream.path).toBe(outputPath);

        }
        await hlsServerConfig.provider.getManifestStream(fakeRequest, cb)
        expect(1).toBe(1);
    });
});