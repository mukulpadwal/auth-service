import app from "./app.js";
import { Config } from "./config/index.js";
import logger from "./config/logger.js";

const startServer = () => {
    const PORT = Config.PORT;
    try {
        app.listen(PORT, () => {
            logger.info("Server up and listening on PORT", { PORT: PORT });
        });
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

startServer();
