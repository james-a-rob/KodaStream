import "reflect-metadata";
import fs from 'fs';
import path from 'path';
import { createLiveEvent } from '../src/db';
import AppDataSource from '../src/data-source';
import { start } from "../src/video-processor";
import { StreamStatus } from "../src/enums";

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

const eventWithScenesAndMetadataAndLoop = {
    url: 'https://streamer.com/output-1234.m3u8',
    loop: true,
    status: StreamStatus.Started,
    scenes: [
        {
            location: 'videos/final_sebastien_stylist_intro.mp4',
            metadata: 'data1',
        },
        {
            location: 'videos/final_sebastien_stylist_intro.mp4',
            metadata: 'data2',
        }
    ]
}

beforeEach(async () => {
    await AppDataSource.initialize();
});

afterEach(async () => {
    await AppDataSource.destroy();
});


describe('video processor', () => {
    test("starts", async () => {

        const event = await createLiveEvent(eventWithScenesAndMetadata);
        const eventsLocation = path.join(__dirname, `../src/events/${event.id}`);

        fs.rmSync(eventsLocation, { recursive: true, force: true });
        start(event.id);
        // look for file
        // get has correct file name corosponding to video
        // m3u8 called correct no-metadata
        console.log(`${eventsLocation}/output-initial.m3u8`);
        const exists = await waitForFileExists(`${eventsLocation}/output-initial.m3u8`);
        expect(exists).toBe(true);

    }, 20000);

    xtest("loops", async () => {

        const event = await createLiveEvent(eventWithScenesAndMetadataAndLoop);
        const eventsLocation = path.join(__dirname, `../src/events/${event.id}`);

        fs.rmSync(eventsLocation, { recursive: true, force: true });
        start(event.id);
        // look for file
        // get has correct file name corosponding to video
        // m3u8 called correct no-metadata
        const videoFileOneExists = await waitForFileExists(`${eventsLocation}/file-1-000.ts`);
        const videoFileTwoExists = await waitForFileExists(`${eventsLocation}/file-2-000.ts`);
        const videoFileThreeExists = await waitForFileExists(`${eventsLocation}/file-1-000.ts`);


        expect(videoFileOneExists).toBe(true);
        expect(videoFileTwoExists).toBe(true);
        expect(videoFileThreeExists).toBe(true);


        // 

    }, 20000);
})