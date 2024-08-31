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
        synchronize: true,
        logging: false,

    },
    "prod": {
        ssl: true,
        "extra": {
            "ssl": {
                "rejectUnauthorized": false
            }
        },
        type: "postgres",
        host: process.env.DB_HOST,
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        port: 25060,
        synchronize: true,
        logging: false,

    }
}

export default config