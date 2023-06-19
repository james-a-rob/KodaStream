import "reflect-metadata";

import AppDataSource from './data-source';
import { Event } from "./entity/Event";
import { Scene } from "./entity/Scene";
import { StreamStatus } from "./enums";


export const createLiveEvent = async (liveEvent): Promise<Event> => {

    const eventRepository = AppDataSource.getRepository(Event);
    const scenes = liveEvent.scenes.map((scene) => {
        const currentScene = new Scene();
        currentScene.location = scene.location;
        currentScene.metadata = scene.metadata;

        return currentScene;
    })

    const event = new Event();

    event.url = "output.m3u8";
    event.loop = liveEvent.loop;
    event.status = liveEvent.status || StreamStatus.Started;
    event.scenes = scenes;

    const savedEvent = await eventRepository.save(event);
    savedEvent.url = `/events/${savedEvent.id}/output.m3u8`;

    //save again. This time setting url using id
    await eventRepository.save(savedEvent);
    return savedEvent;
}

export const getLiveEvent = async (id: string): Promise<Event> => {
    const eventRepository = AppDataSource.getRepository(Event)

    const event = await eventRepository.findOne({
        where: {
            id: parseInt(id)
        },
        relations: {
            scenes: true
        },
    });
    return event;
}

export const updateLiveEvent = async (id: string, liveEvent): Promise<Event> => {
    const eventRepository = AppDataSource.getRepository(Event)

    const event = await eventRepository.findOne({
        where: {
            id: parseInt(id)
        },
        relations: {
            scenes: true
        },
    });

    const updatedEvent = { ...event, ...liveEvent }
    updatedEvent.scenes = liveEvent.scenes || updatedEvent.scenes;
    await eventRepository.save(updatedEvent);

    return updatedEvent;
}


