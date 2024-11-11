import "reflect-metadata";
import { DataSource } from "typeorm";
import { Event } from "./entity/Event";
import { Scene } from "./entity/Scene";
import { Log } from "./entity/Log";
import config from './config';
import { join } from 'path';
import { readdirSync } from 'fs';
// hacky workaround to get dirname working in dev, test and production. 
import __dirname from './current-path.cjs';
const migrationsDir = join(__dirname, 'migration');
// Need to handle migration file location in TS and JS. 
const getMigrationFiles = (dir) => {
    try {
        const files = readdirSync(dir);
        // Filter for TypeScript and JavaScript migration files
        return files.filter(file => file.endsWith('.ts') || file.endsWith('.js'))
            .map(file => join(dir, file));
    }
    catch (error) {
        console.error("Error reading migrations directory:", error);
        return [];
    }
};
const migrationFiles = getMigrationFiles(migrationsDir);
// const AppDataSource = new DataSource(dbConfig)
const AppDataSource = new DataSource(Object.assign({ entities: [Event, Scene, Log], migrations: migrationFiles }, config[process.env.NODE_ENV]));
export default AppDataSource;
//# sourceMappingURL=data-source.js.map