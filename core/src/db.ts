import "reflect-metadata";
import { MoreThan } from "typeorm"
import moment from 'moment';
import AppDataSource from './data-source';
import { Event } from "./entity/Event";
import { Scene } from "./entity/Scene";
import { Viewer } from "./entity/Viewer";
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

export const logViewer = async (datetime: string, sessionId: string, eventId: string) => {
    const viewerRepository = AppDataSource.getRepository(Viewer)
    const event = await getLiveEvent(eventId);

    const existingViewer = await viewerRepository.findOneBy({
        sessionId: sessionId,
    })


    if(existingViewer){
        existingViewer.datetime = datetime;
        viewerRepository.save(existingViewer);
        return existingViewer;
    }else{
        const viewer = {
            datetime,
            sessionId,
            event: event
        };
    
    
        const savedViewer = await viewerRepository.save(viewer);
    
        return savedViewer;
    }

}

export const getViewers = async (eventId: string) => {
    const singleSecond = 1000;
    const viewerRepository = AppDataSource.getRepository(Viewer);

    const time60MinAgo = Date.now() - (singleSecond * (60 * 60));
    const time60MinAgoFormated = moment(time60MinAgo).utc().format()

    const viewers = await viewerRepository.find({
        cache:3000,
        where: {
            datetime: MoreThan(time60MinAgoFormated),
            event: {
                id: parseInt(eventId),
            }
        },
        relations: {
            event: true
        },
    });

    return {
        currentViewers: viewers.length
    }
}


