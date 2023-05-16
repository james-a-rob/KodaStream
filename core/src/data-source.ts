import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entity/User"

const AppDataSource = new DataSource({
    type: "sqlite",
    database: ":memory:",
    dropSchema: true,
    entities: [User],
    synchronize: true,
    logging: false
})
export default AppDataSource;
