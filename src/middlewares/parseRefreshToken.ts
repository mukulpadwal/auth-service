import { expressjwt } from "express-jwt";
import { Config } from "../config/index.js";
import { Request } from "express";
import { AuthCookies } from "../types/index.js";

export default expressjwt({
    secret: Config.JWT_REFRESH_TOKEN_SECRET,
    algorithms: ["HS256"],
    getToken: function (req: Request) {
        const { refreshToken } = req.cookies as AuthCookies;
        return refreshToken;
    },
});
