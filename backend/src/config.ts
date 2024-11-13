import { ConnectionOptions, DatabaseType } from 'typeorm';

type Config = {
    test: ConnectionOptions,
    dev: ConnectionOptions,
    prod: ConnectionOptions
}

const config: Config = {
    "test": {
        type: "sqlite",
        database: ":memory:",
        dropSchema: true,
        synchronize: true,
        logging: false,

    },
    "dev": {
        type: "postgres",
        host: 'localhost',
        username: 'postgres',
        password: '1234',
        database: 'kodastream-dev',
        port: 5432,
        dropSchema: false,
        synchronize: false,
        logging: false,


    },
    "prod": {
        type: "postgres",
        host: 'localhost',
        username: 'postgres',
        password: '1234',
        database: 'kodastream-dev',
        port: 5432,
        dropSchema: false,
        synchronize: false,
        logging: false,
    }
}

export default config