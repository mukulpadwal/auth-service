import express from "express";

const app = express();

app.get("/", (_, res) => {
    return res.status(200).json({
        success: true,
        message: "Server is healthy...",
        data: null,
    });
});

import authRouter from "./routes/auth.routes";

app.use("/api/v1/auth", authRouter);

export default app;
