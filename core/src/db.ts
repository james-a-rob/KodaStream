import { type LiveEvent, LiveEventInput } from "./types";
import AppDataSource from './data-source';
import { User } from "./entity/User"

import "reflect-metadata"

const events: LiveEvent[] = [];


export const createLiveEvent = async (liveEvent: LiveEventInput): Promise<LiveEvent> => {

    const userRepository = AppDataSource.getRepository(User)

    const user = new User()
    user.firstName = "Timber"
    user.lastName = "Saw"
    user.age = 25
    await userRepository.save(user)

    const allUsers = await userRepository.find()

    const newLiveEvent = {
        id: '1234',
        ...liveEvent
    };
    events.push(newLiveEvent);
    return newLiveEvent;
}

export const getLiveEvent = async (id: string): Promise<LiveEvent> => {
    const userRepository = AppDataSource.getRepository(User)

    const user = new User()
    user.firstName = "Timber"
    user.lastName = "Saw"
    user.age = 25
    await userRepository.save(user)

    const allUsers = await userRepository.find()

    const event = events.find((event) => event.id === id);
    if (event) {
        return event;
    } else {
        return null;
    }

}



