import { expressjwt } from "express-jwt";
import { Config } from "../config";
import { Request } from "express";
import { AuthCookies } from "../types";

export default expressjwt({
    secret: Config.JWT_REFRESH_TOKEN_SECRET!,
    algorithms: ["HS256"],
    getToken: function (req: Request) {
        const { refreshToken } = req.cookies as AuthCookies;
        return refreshToken;
    },
});
