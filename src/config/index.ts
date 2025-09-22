import dotenv from "dotenv";
import z from "zod";

dotenv.config({
    path: `.env.${process.env.NODE_ENV || "dev"}`,
});

const envSchema = z.object({
    PORT: z.preprocess((val) => Number(val), z.number()),
    NODE_ENV: z.enum(["dev", "prod", "test"]),
    JWT_REFRESH_TOKEN_SECRET: z.string(),
    JWT_REFRESH_TOKEN_EXPIRY: z.string(),
    JWT_REFRESH_TOKEN_ISSUER: z.string(),
    JWT_ACCESS_TOKEN_EXPIRY: z.string(),
    JWT_ACCESS_TOKEN_ISSUER: z.string(),
    CLIENT_BASE_URL: z.string(),
    JWKS_URI_ENDPOINT: z.string(),
    DATABASE_URL: z.string(),
    PRIVATE_KEY: z.string(),
    ADMIN_FIRSTNAME: z.string(),
    ADMIN_LASTNAME: z.string(),
    ADMIN_EMAIL: z.string(),
    ADMIN_ROLE: z.enum(["ADMIN"]),
    ADMIN_PASSWORD: z.string(),
    ADMIN_AGE: z.preprocess((val) => Number(val), z.number().int().positive()),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error("❌ Invalid environment variables:");
    console.error(z.treeifyError(parsedEnv.error));
    process.exit(1);
}

export const Config = Object.freeze(parsedEnv.data);
