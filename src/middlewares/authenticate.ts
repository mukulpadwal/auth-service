import { Request } from "express";
import { expressjwt } from "express-jwt";
import jwksClient from "jwks-rsa";
import { Config } from "../config/index.js";

export default expressjwt({
    secret: jwksClient.expressJwtSecret({
        jwksUri: Config.JWKS_URI_ENDPOINT!,
        cache: true,
        rateLimit: true,
    }),
    algorithms: ["RS256"],
    getToken: function (req: Request) {
        // Getting token through authorization header if present
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.split(" ")[1] !== "undefined") {
            const token = authHeader.split(" ")[1];

            if (token) {
                return token;
            }
        }

        // Getting token through cookies if not present in headers
        const { accessToken } = req.cookies as Record<string, string>;
        return accessToken;
    },
});
