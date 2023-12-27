import "reflect-metadata";
import { DataSource } from "typeorm";

import { Event } from "./entity/Event";
import { Scene } from "./entity/Scene";
import { Viewer } from "./entity/Viewer";

import config from './config';


// const AppDataSource = new DataSource(dbConfig)
const AppDataSource = new DataSource({
    entities: [Event, Scene, Viewer],

    ...config['dev']
})
export default AppDataSource;
