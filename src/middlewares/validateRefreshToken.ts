import { expressjwt } from "express-jwt";
import { Config } from "../config";
import { Request } from "express";
import { AuthCookies, IRefreshTokenPayload } from "../types";
import logger from "../config/logger";
import { prisma } from "../server";

export default expressjwt({
    secret: Config.JWT_REFRESH_TOKEN_SECRET!,
    algorithms: ["HS256"],
    getToken: function (req: Request) {
        const { refreshToken } = req.cookies as AuthCookies;
        return refreshToken;
    },
    isRevoked: async function (req: Request, token) {
        try {
            const refreshToken = await prisma.refreshToken.findFirst({
                where: {
                    id: Number((token?.payload as IRefreshTokenPayload)?.id),
                    user: {
                        id: Number(token?.payload.sub),
                    },
                },
            });

            return refreshToken === null;
        } catch (err) {
            logger.error(
                "Error while getting the refresh token",
                {
                    id: Number((token?.payload as IRefreshTokenPayload).id),
                },
                { err }
            );
        }

        return true;
    },
});
