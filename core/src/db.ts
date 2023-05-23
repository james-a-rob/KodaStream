import "reflect-metadata";

import AppDataSource from './data-source';
import { Event } from "./entity/Event";
import { Scene } from "./entity/Scene";


export const createLiveEvent = async (liveEvent): Promise<Event> => {

    const eventRepository = AppDataSource.getRepository(Event);
    const scenes = liveEvent.scenes.map((scene) => {
        const currentScene = new Scene();
        currentScene.location = scene.location;
        currentScene.metadata = scene.metadata;

        return currentScene;
    })

    const event = new Event();

    event.url = liveEvent.url;
    event.loop = liveEvent.loop;
    event.status = liveEvent.status;
    event.scenes = scenes;

    await eventRepository.save(event);

    return event;
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


    const updatedScenes = [...event.scenes, ...liveEvent.scenes];

    event.scenes = updatedScenes;

    await eventRepository.save(event);

    return event;
}


