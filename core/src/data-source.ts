import "reflect-metadata";
import { DataSource } from "typeorm";

import { Event } from "./entity/Event";
import { Scene } from "./entity/Scene";
import { Log } from "./entity/Log";

import config from './config';

// const AppDataSource = new DataSource(dbConfig)
const AppDataSource = new DataSource({
    entities: [Event, Scene, Log],

    ...config[process.env.NODE_ENV]
})
export default AppDataSource;
