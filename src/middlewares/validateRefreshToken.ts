import { expressjwt } from "express-jwt";
import { Config } from "../config";
import { Request } from "express";
import { AuthCookies, IRefreshTokenPayload } from "../types";
import { AppDataSource } from "../config/data-source";
import { RefreshToken } from "../entity/RefreshToken";
import logger from "../config/logger";

export default expressjwt({
    secret: Config.JWT_REFRESH_TOKEN_SECRET!,
    algorithms: ["HS256"],
    getToken: function (req: Request) {
        const { refreshToken } = req.cookies as AuthCookies;
        return refreshToken;
    },
    isRevoked: async function (req: Request, token) {
        try {
            const refreshTokenRepository =
                AppDataSource.getRepository(RefreshToken);
            const refreshToken = await refreshTokenRepository.findOne({
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
