"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLiveEventStatus = exports.getLiveEvent = exports.createLiveEvent = exports.StreamStatus = void 0;
// create live event
var StreamStatus;
(function (StreamStatus) {
    StreamStatus["NotStarted"] = "not-started";
    StreamStatus["Started"] = "started";
    StreamStatus["Finished"] = "finished";
})(StreamStatus = exports.StreamStatus || (exports.StreamStatus = {}));
const events = [];
const createLiveEvent = () => {
    const newLiveEvent = {
        id: "1",
        status: StreamStatus.NotStarted
    };
    events.push(newLiveEvent);
    return newLiveEvent;
};
exports.createLiveEvent = createLiveEvent;
const getLiveEvent = (id) => {
    const event = events.find((event) => event.id === id);
    console.log('event log', event);
    if (event) {
        return event;
    }
    else {
        return null;
    }
};
exports.getLiveEvent = getLiveEvent;
const updateLiveEventStatus = (id, streamStatus) => {
    const event = events.find((event) => event.id === id);
    console.log('event log', event);
    if (event) {
        event.status = streamStatus;
        return event;
    }
    else {
        return null;
    }
};
exports.updateLiveEventStatus = updateLiveEventStatus;
// reduce to one basic start live stream that includes video location
