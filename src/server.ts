import app from "./app.js";
import { AppDataSource } from "./config/data-source.js";
import { Config } from "./config/index.js";
import logger from "./config/logger.js";

const startServer = async () => {
    const PORT = Config.PORT;
    try {
        await AppDataSource.initialize();
        logger.info("DataBase Connected Successfully...");
        app.listen(PORT, () => {
            logger.info("Server up and listening on PORT", { PORT: PORT });
        });
    } catch (error) {
        logger.error("Something went wrong while starting the server", error);
        process.exit(1);
    }
};

startServer().catch((error) => logger.error(error));
