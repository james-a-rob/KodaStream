import "reflect-metadata";
import fs from 'fs';
import path from 'path';
import { createLiveEvent } from '../src/db';
import AppDataSource from '../src/data-source';
import { start } from "../src/video-processor";
import { StreamStatus } from "../src/enums";

async function waitForFileExists(filePath, currentTime = 0, timeout = 5000) {
    if (fs.existsSync(filePath)) return true;
    if (currentTime === timeout) return false;
    // wait for 1 second
    await new Promise((resolve, reject) => setTimeout(() => resolve(true), 1000));
    // waited for 1 second
    return waitForFileExists(filePath, currentTime + 1000, timeout);
}

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
        start(1);
        // look for file
        // get has correct file name corosponding to video
        // m3u8 called correct no-metadata
        const exists = await waitForFileExists(`${eventsLocation}/output-initial.m3u8`);
        expect(exists).toBe(true);

    }, 10000);
})