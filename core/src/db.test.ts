import AppDataSource from './data-source';

import { createLiveEvent, getLiveEvent } from './db';
import { StreamStatus } from "./enums";

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


test('create live event', async () => {


  expect(await createLiveEvent(inputEvent)).toEqual({
    id: '1234',
    url: 'https://streamer.com/output-1234.m3u8',
    status: 'started',
    scenes: [
      {
        url: 'https://s3.com/videos/1234.mp4'
      }
    ]
  });
});

test('get live event by id', async () => {
  const liveEvent = await createLiveEvent(inputEvent);
  expect(await getLiveEvent(liveEvent.id)).toEqual({
    id: '1234',
    url: 'https://streamer.com/output-1234.m3u8',
    status: 'started',
    scenes: [
      {
        url: 'https://s3.com/videos/1234.mp4'
      }
    ]
  });
});