import app from "./app.js";
import { Config } from "./config/index.js";
import logger from "./config/logger.js";
import { prisma } from "./prisma.js";
import { UserService } from "./services/index.js";

const startServer = async () => {
    const PORT = Config.PORT;
    try {
        await prisma.$connect();
        logger.info("DataBase Connected Successfully...");

        const userService = new UserService(prisma.user);

        await userService.createAdminUserIfNotExists();

        app.listen(PORT, () => {
            logger.info("Server up and listening on PORT", { PORT: PORT });
        });
    } catch (error) {
        logger.error("Something went wrong while starting the server", error);
        await prisma.$disconnect();
        process.exit(1);
    }
};

startServer().catch(async (error) => {
    logger.error(error);
    await prisma.$disconnect();
});
