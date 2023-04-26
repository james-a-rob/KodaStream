"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require("./");
test('create live event', () => {
    expect((0, _1.createLiveEvent)()).toEqual({ id: "1", status: 'not-started' });
});
test('get live event by id', () => {
    const liveEvent = (0, _1.createLiveEvent)();
    expect((0, _1.getLiveEvent)(liveEvent.id)).toEqual({ id: "1", status: 'not-started' });
});
test('update live event status by id', () => {
    const liveEvent = (0, _1.createLiveEvent)();
    (0, _1.updateLiveEventStatus)(liveEvent.id, _1.StreamStatus.Started);
    expect((0, _1.getLiveEvent)("1")).toEqual({ id: "1", status: 'started' });
});
