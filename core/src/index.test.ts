import { createLiveEvent, getLiveEvent, updateLiveEventStatus, StreamStatus } from './';

test('create live event', () => {
  expect(createLiveEvent()).toEqual({id: "1", status: 'not-started'});
});

test('get live event by id', () => {
    const liveEvent = createLiveEvent();
    expect(getLiveEvent(liveEvent.id)).toEqual({id: "1", status: 'not-started'});
});

test('update live event status by id', () => {
    const liveEvent = createLiveEvent();
    updateLiveEventStatus(liveEvent.id, StreamStatus.Started)
    expect(getLiveEvent("1")).toEqual({id: "1", status: 'started'});
});