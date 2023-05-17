import { LiveEventInput } from "./types";
import { StreamStatus } from "./enums";
import AppDataSource from './data-source';
import { Event } from "./entity/Event";
import { Scene } from "./entity/Scene";
import "reflect-metadata"


export const createLiveEvent = async (liveEvent: LiveEventInput): Promise<Event> => {

    const eventRepository = AppDataSource.getRepository(Event);
    const sceneRepository = AppDataSource.getRepository(Scene);
    const sceneOne = new Scene();
    sceneOne.location = "https://s3.com/videos/1234.mp4";

    const event = new Event();

    event.url = 'https://streamer.com/output-1234.m3u8';

    event.status = StreamStatus.Started;

    event.scenes = [sceneOne];

    await eventRepository.save(event);

    const allEvents = await eventRepository.find();

    console.log(allEvents);

    return event;
}

export const getLiveEvent = async (id: string) => {
    const eventRepository = AppDataSource.getRepository(Event)


    // const event = events.find((event) => event.id === id);
    // if (event) {
    //     return event;
    // } else {
    //     return null;
    // }

}



