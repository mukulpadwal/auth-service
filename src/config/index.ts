import dotenv from "dotenv";

dotenv.config({
    path: `.env.${process.env.NODE_ENV}`,
});

const {
    PORT,
    NODE_ENV,
    DB_HOST,
    DB_PORT,
    DB_USERNAME,
    DB_PASSWORD,
    DB_NAME,
    JWT_REFRESH_TOKEN_SECRET,
    JWT_REFRESH_TOKEN_EXPIRY,
    JWT_REFRESH_TOKEN_ISSUER,
    JWT_ACCESS_TOKEN_EXPIRY,
    JWT_ACCESS_TOKEN_ISSUER,
} = process.env;

export const Config = {
    PORT,
    NODE_ENV,
    DB_HOST,
    DB_PORT,
    DB_USERNAME,
    DB_PASSWORD,
    DB_NAME,
    JWT_REFRESH_TOKEN_SECRET,
    JWT_REFRESH_TOKEN_EXPIRY,
    JWT_REFRESH_TOKEN_ISSUER,
    JWT_ACCESS_TOKEN_EXPIRY,
    JWT_ACCESS_TOKEN_ISSUER,
};
