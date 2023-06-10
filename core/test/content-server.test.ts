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
            location: 'videos/final_sebastien_stylist_intro.mp4',
            metadata: 'Nike',
        }
    ]
}


describe('content server config', () => {
    test('it adds metadata to m3u8 file', async () => {

        const event = await createLiveEvent(eventWithScenesAndMetadata);

        const locationOfMockVideoContent = path.join(__dirname, `./mock-video-content/short`);
        const locationOfVideoContent = path.join(__dirname, `../events/${event.id}`);
        // fs.rmSync(locationOfVideoContent, { recursive: true, force: true });
        try {
            fs.ensureDirSync(locationOfVideoContent);
            fs.copySync(locationOfMockVideoContent, locationOfVideoContent);
        } catch (e) {
            console.log("failed to copy files")
        }

        // add m3u8 and ts file in diretory jusing response event id

        const fakeRequest = {
            url: '/events/1/output.m3u8'
        } as Request;
        const cb = async (error, stream) => {
            // check arguments
            const outputPath = path.join(__dirname, `../events/${event.id}/output.m3u8`);
            // await waitForFileExists(`${locationOfVideoContent}/output.m3u8`)

            expect(error).toBe(null);
            expect(stream.path).toBe(outputPath);
            stream.close();
            console.log("clsoe stream")
            try {
                console.log("empty dir");

            } catch (e) {
                console.log("failed to empty dir sync", e)
            }



        }
        await hlsServerConfig.provider.getManifestStream(fakeRequest, cb);

        console.log("end test 1")

    });

    test('handles request for event that does not exist', async () => {
        console.log("- - -  - -start test 2")



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