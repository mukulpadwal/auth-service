import "reflect-metadata";
import express, {
    type NextFunction,
    type Request,
    type Response,
} from "express";
import type { HttpError } from "http-errors";
import cors from "cors";

const app = express();
app.use(
    cors({
        origin: [String(Config.CLIENT_BASE_URL)],
        credentials: true,
    })
);
app.use(express.json());

app.get("/", (_, res) => {
    return res.status(200).json({
        success: true,
        message: "Server is healthy...",
        data: null,
    });
});

import authRouter from "./routes/auth.routes";
import logger from "./config/logger";
import { Config } from "./config";

app.use("/api/v1/auth", authRouter);

// Global Error Handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message);
    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        errors: [
            {
                type: err.name,
                message: err.message,
                path: "",
                location: "",
            },
        ],
    });
});

export default app;
