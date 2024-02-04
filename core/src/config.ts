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
        database: 'lope',
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
        host: 'db-postgresql-lon1-42377-do-user-12013722-0.c.db.ondigitalocean.com',
        username: 'doadmin',
        password: 'AVNS_pdAmOsOlqXefNKZzT9v',
        database: 'lope',
        port: 25060,
        synchronize: true,
        logging: false,

    }
}

export default config