import { type LiveEvent, LiveEventInput } from "./types";
import { StreamStatus } from './enums';

const events: LiveEvent[] = [];


export const createLiveEvent = (liveEvent: LiveEventInput): LiveEvent => {
    const newLiveEvent = {
        id: '1234',
        ...liveEvent
    };
    events.push(newLiveEvent);
    return newLiveEvent;
}

export const getLiveEvent = (id: string): LiveEvent | null => {
    const event = events.find((event) => event.id === id);
    console.log('event log', event);
    if (event) {
        return event;
    } else {
        return null;
    }

}



