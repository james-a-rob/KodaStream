// create live event
export enum StreamStatus {
    NotStarted = "not-started",
    Started = "started",
    Finished = "finished"
}

interface LiveEvent {
    id: string,
    status: StreamStatus
}

const events: LiveEvent[] = [];

export const createLiveEvent = (): LiveEvent => {
    const newLiveEvent = {
        id: "1",
        status: StreamStatus.NotStarted
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

export const updateLiveEventStatus = (id: string, streamStatus: StreamStatus): LiveEvent | null => {
    const event = events.find((event) => event.id === id);
    console.log('event log', event);
    if (event) {
        event.status = streamStatus;
        return event;
    } else {
        return null;
    } 
}

// add scene to live event

