const config = {
    "test": {
        type: "sqlite",
        database: ":memory:",
        dropSchema: true,
        synchronize: true,
        logging: false,
    },
    "dev": {
        type: "postgres",
        host: 'db',
        username: 'postgres',
        password: 'password',
        database: 'koda-db',
        port: 5432,
        dropSchema: false,
        synchronize: false,
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
        dropSchema: false,
        synchronize: false,
        logging: false,
    }
};
export default config;
//# sourceMappingURL=config.js.map