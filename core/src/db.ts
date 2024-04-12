import "reflect-metadata";
import { MoreThan } from "typeorm"
import moment from 'moment';
import AppDataSource from './data-source';
import { Event } from "./entity/Event";
import { Scene } from "./entity/Scene";
import { Log } from "./entity/Log";
import { StreamStatus, LogType } from "./enums";


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

export const log = async (datetime: string, sessionId: string, eventId: string, type: LogType, name: string, url: string) => {
    const logRepository = AppDataSource.getRepository(Log)
    const event = await getLiveEvent(eventId);

    const log = {
        datetime,
        sessionId,
        event: event,
        type: type,
        name: name,
        url: url
    };


    const savedLog = await logRepository.save(log);
    return savedLog;

}

export const getViewers = async (eventId: string) => {
    const singleSecond = 1000;
    const logRepository = AppDataSource.getRepository(Log);

    const time60MinAgo = Date.now() - (singleSecond * (60 * 60));
    const time60MinAgoFormated = moment(time60MinAgo).utc().format()


    const currentViewers = await logRepository
        .createQueryBuilder("log")
        .leftJoinAndSelect("log.event", "event")
        .select("log.sessionId")

        .where("log.datetime > :datetime", { datetime: time60MinAgoFormated })
        .andWhere("log.type = :type", { type: LogType.View })
        .andWhere("event.id = :id", { id: parseInt(eventId) })
        .addGroupBy("log.sessionId")
        .getRawMany()


    return {
        currentViewers: currentViewers.length
    }
}


