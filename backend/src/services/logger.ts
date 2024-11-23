import winston from 'winston';

class Logger {
    private static instance: winston.Logger;

    private constructor() {
        // Private constructor to prevent instantiation
    }

    private static createLogger(): winston.Logger {
        return winston.createLogger({
            level: 'error',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
            transports: [
                new winston.transports.Console(),
                new winston.transports.File({ filename: 'app.log', level: 'info' }),
                new winston.transports.File({ filename: 'error.log', level: 'error' })
            ],
        });
    }

    public static getLogger(): winston.Logger {
        if (!Logger.instance) {
            Logger.instance = Logger.createLogger();
        }
        return Logger.instance;
    }
}

export default Logger;
