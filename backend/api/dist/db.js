var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import "reflect-metadata";
import moment from 'moment';
import AppDataSource from './data-source';
import { Event } from "./entity/Event";
import { Scene } from "./entity/Scene";
import { Log } from "./entity/Log";
import { StreamStatus, LogType } from "./enums";
export const createLiveEvent = (liveEvent) => __awaiter(void 0, void 0, void 0, function* () {
    const eventRepository = AppDataSource.getRepository(Event);
    const scenes = liveEvent.scenes.map((scene) => {
        const currentScene = new Scene();
        currentScene.location = scene.location;
        currentScene.metadata = scene.metadata;
        return currentScene;
    });
    const event = new Event();
    event.url = "output.m3u8";
    event.loop = liveEvent.loop;
    event.status = liveEvent.status || StreamStatus.Started;
    event.scenes = scenes;
    const savedEvent = yield eventRepository.save(event);
    savedEvent.url = `/events/${savedEvent.id}/output.m3u8`;
    //save again. This time setting url using id
    yield eventRepository.save(savedEvent);
    return savedEvent;
});
export const getLiveEvent = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const eventRepository = AppDataSource.getRepository(Event);
    const event = yield eventRepository.findOne({
        where: {
            id: parseInt(id)
        },
        relations: {
            scenes: true
        },
    });
    return event;
});
export const updateLiveEvent = (id, liveEvent) => __awaiter(void 0, void 0, void 0, function* () {
    const eventRepository = AppDataSource.getRepository(Event);
    const event = yield eventRepository.findOne({
        where: {
            id: parseInt(id)
        },
        relations: {
            scenes: true
        },
    });
    const updatedEvent = Object.assign(Object.assign({}, event), liveEvent);
    updatedEvent.scenes = liveEvent.scenes || updatedEvent.scenes;
    yield eventRepository.save(updatedEvent);
    return updatedEvent;
});
export const log = (datetime, sessionId, eventId, type, name, url) => __awaiter(void 0, void 0, void 0, function* () {
    const logRepository = AppDataSource.getRepository(Log);
    const event = yield getLiveEvent(eventId);
    const log = {
        datetime,
        sessionId,
        event: event,
        type: type,
        name: name,
        url: url
    };
    const savedLog = yield logRepository.save(log);
    return savedLog;
});
export const getViewers = (eventId) => __awaiter(void 0, void 0, void 0, function* () {
    const singleSecond = 1000;
    const logRepository = AppDataSource.getRepository(Log);
    const time60MinAgo = Date.now() - (singleSecond * (60 * 60));
    const time60MinAgoFormated = moment(time60MinAgo).utc().format();
    const currentViewers = yield logRepository
        .createQueryBuilder("log")
        .leftJoinAndSelect("log.event", "event")
        .select("log.sessionId")
        .where("log.datetime > :datetime", { datetime: time60MinAgoFormated })
        .andWhere("log.type = :type", { type: LogType.View })
        .andWhere("event.id = :id", { id: parseInt(eventId) })
        .addGroupBy("log.sessionId")
        .getRawMany();
    return {
        currentViewers: currentViewers.length
    };
});
//# sourceMappingURL=db.js.map