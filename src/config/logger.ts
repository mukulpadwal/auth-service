import winston from "winston";
import { Config } from ".";

const logger = winston.createLogger({
    level: "info",
    defaultMeta: {
        serviceName: "auth-service",
    },
    transports: [
        new winston.transports.File({
            level: "info",
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
            dirname: "logs",
            filename: "combined.log",
            silent: Config.NODE_ENV === "test",
        }),
        new winston.transports.File({
            level: "error",
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
            dirname: "logs",
            filename: "error.log",
            silent: Config.NODE_ENV === "test",
        }),
        new winston.transports.Console({
            level: "info",
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
            silent: Config.NODE_ENV === "test",
        }),
    ],
});

export default logger;
