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
        ssl: {
            rejectUnauthorized: true,
            ca: process.env.CACERT,
        },
        type: "postgres",
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        dropSchema: false,
        synchronize: false,
        logging: false,
    }
}

export default config