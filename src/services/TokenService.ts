import jwt, { JwtPayload } from "jsonwebtoken";
import createHttpError from "http-errors";
import { Config } from "../config/index.js";
import { PrismaClient, User } from "../../generated/prisma/index.js";

export default class TokenService {
    constructor(private refreshToken: PrismaClient["refreshToken"]) {}

    generateAccessToken(payload: JwtPayload) {
        let privateKey: string;

        if (!Config.PRIVATE_KEY) {
            const error = createHttpError(500, "PRIVATE_KEY is missing.");
            throw error;
        }

        try {
            privateKey = Config.PRIVATE_KEY;

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            const error = createHttpError(500, "Could not read private key.");
            throw error;
        }

        const accessToken = jwt.sign(payload, privateKey, {
            algorithm: "RS256",
            expiresIn: "1h",
            issuer: "auth-service",
        });

        return accessToken;
    }

    generateRefreshToken(payload: JwtPayload) {
        const refreshToken = jwt.sign(
            payload,
            String(Config.JWT_REFRESH_TOKEN_SECRET!),
            {
                algorithm: "HS256",
                expiresIn: "1y",
                issuer: "auth-service",
                jwtid: String(payload.id),
            }
        );

        return refreshToken;
    }

    async persistRefreshToken(user: User) {
        const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365;

        const createdRefreshToken = await this.refreshToken.create({
            data: {
                user: { connect: { id: user.id } },
                expiresAt: new Date(Date.now() + MS_IN_YEAR),
            },
        });

        return createdRefreshToken;
    }

    async deleteRefreshToken(tokenId: number) {
        return await this.refreshToken.delete({ where: { id: tokenId } });
    }
}
