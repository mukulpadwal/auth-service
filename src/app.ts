import "reflect-metadata";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";
import express, {
    type NextFunction,
    type Request,
    type Response,
} from "express";
import type { HttpError } from "http-errors";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes";
import logger from "./config/logger";
import { Config } from "./config";
import helmet from "helmet";

// Proper __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cookieParser());
app.use(helmet());
app.use(cors({ origin: [String(Config.CLIENT_BASE_URL)], credentials: true }));
app.use(express.json());

let jwksCache = "";
(async () => {
    const jwksPath = path.join(__dirname, "../public/.well-known/jwks.json");
    jwksCache = await fs.readFile(jwksPath, "utf8");
})().catch((error) => console.log(error));

app.get("/.well-known/jwks.json", (_, res: Response) => {
    res.setHeader("Content-Type", "application/json");
    res.status(200).send(jwksCache);
});

app.get("/", (_, res) => {
    return res.status(200).json({
        success: true,
        message: "Server is healthy...",
        data: null,
    });
});

app.use("/api/v1/auth", authRouter);

// Global Error Handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message);
    const statusCode = err.statusCode || err.status || 500;

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
