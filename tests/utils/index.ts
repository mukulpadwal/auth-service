import { Config } from "../../src/config/index";
import { PrismaClient } from "../../generated/prisma";

export const prisma = new PrismaClient({
    datasources: { db: { url: Config.DATABASE_URL } },
});

export const isJwt = (token: string | null): boolean => {
    const parts = token?.split(".");

    if (parts?.length !== 3) {
        return false;
    }

    try {
        parts.forEach((part) => {
            Buffer.from(part, "base64").toString("utf-8");
        });
    } catch (error) {
        return false;
    }

    return true;
};
