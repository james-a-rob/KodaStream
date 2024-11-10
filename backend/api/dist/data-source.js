import "reflect-metadata";
import { DataSource } from "typeorm";
import { Event } from "./entity/Event";
import { Scene } from "./entity/Scene";
import { Log } from "./entity/Log";
import config from './config';
// const AppDataSource = new DataSource(dbConfig)
const AppDataSource = new DataSource(Object.assign({ entities: [Event, Scene, Log], migrations: ['./src/migration/*.{ts,js}'] }, config[process.env.NODE_ENV]));
export default AppDataSource;
//# sourceMappingURL=data-source.js.map