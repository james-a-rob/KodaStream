import "reflect-metadata";
import { DataSource } from "typeorm";
import { Event } from "./entity/Event";
import { Scene } from "./entity/Scene";

const AppDataSource = new DataSource({
    type: "sqlite",
    database: ":memory:",
    dropSchema: true,
    entities: [Event, Scene],
    synchronize: true,
    logging: false
})
export default AppDataSource;
