import "reflect-metadata";
import fs from 'fs-extra';
import path from 'path';
import { createLiveEvent, updateLiveEvent, getLiveEvent } from '../src/db';
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
            location: 'videos/test-vids/short-test.mp4',
            metadata: 'Nike',
        },
        {
            location: 'videos/test-vids/short-test.mp4',
            metadata: 'Nike2',
        }
    ]
}

const updatedEventWithScenesAndMetadata = {
    scenes: [
        {
            id: 1,
            location: 'videos/test-vids/short-test.mp4',
            metadata: 'Nike',
        },
        {
            id: 2,
            location: 'videos/test-vids/short-test.mp4',
            metadata: 'Nike2',
        },
        {
            location: 'videos/test-vids/short-test.mp4',
            metadata: 'Nike3',
        }
    ]
}

const eventWithScenesAndMetadataAndLoop = {
    url: 'https://streamer.com/output-1234.m3u8',
    loop: true,
    status: StreamStatus.Started,
    scenes: [
        {
            location: 'videos/test-vids/short-test.mp4',
            metadata: 'data1',
        }
    ]
}

const updatedEventWithToBeStopped = {
    status: StreamStatus.Stopped
}

beforeEach(async () => {
    await AppDataSource.initialize();
});

afterEach(async () => {
    await AppDataSource.destroy();
});


describe('video processor', () => {
    test("starts processing", async () => {

        const event = await createLiveEvent(eventWithScenesAndMetadata);
        const eventsLocation = path.join(__dirname, `../events/${event.id}`);
        fs.rmSync(eventsLocation, { recursive: true, force: true });
        start(event.id);

        const exists = await waitForFileExists(`${eventsLocation}/output-initial.m3u8`);
        const tsExists = await waitForFileExists(`${eventsLocation}/file-1-000.ts`);
        const tsExists2 = await waitForFileExists(`${eventsLocation}/file-2-001.ts`);

        expect(exists).toBe(true);
        expect(tsExists).toBe(true);
        expect(tsExists2).toBe(true);


    }, 20000);

    test("updates", async () => {

        const event = await createLiveEvent(eventWithScenesAndMetadata);
        const eventsLocation = path.join(__dirname, `../events/${event.id}`);

        fs.rmSync(eventsLocation, { recursive: true, force: true });

        start(event.id);
        await updateLiveEvent(event.id.toString(), updatedEventWithScenesAndMetadata);


        const exists = await waitForFileExists(`${eventsLocation}/output-initial.m3u8`);

        const tsExists = await waitForFileExists(`${eventsLocation}/file-1-000.ts`);
        const tsExists2 = await waitForFileExists(`${eventsLocation}/file-2-001.ts`);
        const tsExists3 = await waitForFileExists(`${eventsLocation}/file-3-002.ts`);

        expect(exists).toBe(true);
        expect(tsExists).toBe(true);
        expect(tsExists2).toBe(true);
        expect(tsExists3).toBe(true);


    }, 20000);

    test("stops", async () => {

        const event = await createLiveEvent(eventWithScenesAndMetadata);
        const eventsLocation = path.join(__dirname, `../events/${event.id}`);

        fs.rmSync(eventsLocation, { recursive: true, force: true });

        start(event.id);

        await updateLiveEvent(event.id.toString(), updatedEventWithToBeStopped);
        const gottenLiveEvent = await getLiveEvent(event.id.toString());


        const exists = await waitForFileExists(`${eventsLocation}/output-initial.m3u8`);

        const tsExists = await waitForFileExists(`${eventsLocation}/file-1-000.ts`);

        // give time for seconds ts file to potentially appear. Set equal to length of playlist segment
        await new Promise((r) => setTimeout(r, 6000));
        const tsExists2 = fs.existsSync(`${eventsLocation}/file-2-001.ts`);

        expect(exists).toBe(true);
        expect(tsExists).toBe(true);
        expect(tsExists2).toBe(false);



    }, 20000);

    xtest("loops", async () => {

        const event = await createLiveEvent(eventWithScenesAndMetadataAndLoop);
        const eventsLocation = path.join(__dirname, `../../events/${event.id}`);

        fs.rmSync(eventsLocation, { recursive: true, force: true });
        start(event.id);
        await new Promise((r) => setTimeout(r, 6000));

        // look for file
        // get has correct file name corosponding to video
        // m3u8 called correct no-metadata
        console.log('here 1', `${eventsLocation}/file-1-000.ts`)
        // const videoFileOneExists = await waitForFileExists(`${eventsLocation}/file-1-000.ts`);
        const videoFileTwoExists = await waitForFileExists(`${eventsLocation}/file-1-001.ts`);
        // const videoFileThreeExists = await waitForFileExists(`${eventsLocation}/file-1-002.ts`);
        console.log('here 2', videoFileTwoExists)

        // expect(videoFileOneExists).toBe(true);
        expect(videoFileTwoExists).toBe(true);
        // expect(videoFileThreeExists).toBe(true);


        // 

    }, 20000);
})