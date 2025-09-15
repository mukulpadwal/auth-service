import type { NextFunction, Response } from "express";

import type { AuthRequest, UserRequest } from "../types/index.js";
import type { Logger } from "winston";
import { validationResult } from "express-validator";
import { JwtPayload } from "jsonwebtoken";
import createHttpError from "http-errors";
import {
    CredentialService,
    TokenService,
    UserService,
} from "../services/index.js";
import { CookieOptions } from "../constants/index.js";
import ApiResponse from "../utils/ApiResponse.js";

export default class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
        private tokenService: TokenService,
        private credentialService: CredentialService
    ) {}

    async register(req: UserRequest, res: Response, next: NextFunction) {
        // Validation
        const result = validationResult(req);

        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }

        const { firstName, lastName, password, age, email } = req.body;

        this.logger.debug("New request to register a user", {
            firstName,
            lastName,
            password: "******",
            age,
            email,
        });

        try {
            const user = await this.userService.create({
                firstName,
                lastName,
                password,
                age,
                email,
            });

            this.logger.info("User has been registered", { id: user.id });

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);

            // Persist the refresh token
            const createdRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(createdRefreshToken.id),
            });

            res.cookie("accessToken", accessToken, {
                ...CookieOptions,
                maxAge: 1000 * 60 * 60,
            });

            res.cookie("refreshToken", refreshToken, {
                ...CookieOptions,
                maxAge: 1000 * 60 * 60 * 24 * 365,
            });

            return res.status(201).json(
                new ApiResponse(201, "User registered Successfully.", {
                    id: user.id,
                })
            );
        } catch (error) {
            next(error);
            return;
        }
    }

    async login(req: UserRequest, res: Response, next: NextFunction) {
        // Validation
        const result = validationResult(req);

        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }

        // Get the required data
        const { email, password } = req.body;

        this.logger.debug("New request to login a user", {
            email,
            password: "******",
        });

        try {
            // Check if the user exists
            const user = await this.userService.findByEmail(email);

            if (!user) {
                const error = createHttpError(400, "Invalid Credentials.");
                next(error);
                return;
            }

            // Validate the password
            const isValidPassword = await this.credentialService.verifyPassword(
                password,
                user.password
            );

            if (!isValidPassword) {
                const error = createHttpError(400, "Invalid Credentials.");
                next(error);
                return;
            }

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);

            // Persist the refresh token
            const createdRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(createdRefreshToken.id),
            });

            res.cookie("accessToken", accessToken, {
                ...CookieOptions,
                maxAge: 1000 * 60 * 60,
            });

            res.cookie("refreshToken", refreshToken, {
                ...CookieOptions,
                maxAge: 1000 * 60 * 60 * 24 * 365,
            });

            return res.json(
                new ApiResponse(200, "User logged in successfully.", {
                    id: user?.id,
                })
            );
        } catch (error) {
            next(error);
            return;
        }
    }

    async self(req: AuthRequest, res: Response) {
        const user = await this.userService.findById(Number(req.auth.sub));

        return res.json(
            new ApiResponse(200, "Details fetched", {
                ...user,
                password: undefined,
            })
        );
    }

    async refresh(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const user = await this.userService.findById(Number(req.auth.sub));

            if (!user) {
                const error = createHttpError(400, "Invalid User.");
                next(error);
                return;
            }

            this.logger.info("Token refresh request for user", { id: user.id });

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);

            // Persist the refresh token
            const createdRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            // Delete old refresh token
            await this.tokenService.deleteRefreshToken(Number(req.auth.id));

            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(createdRefreshToken.id),
            });

            res.cookie("accessToken", accessToken, {
                ...CookieOptions,
                maxAge: 1000 * 60 * 60,
            });

            res.cookie("refreshToken", refreshToken, {
                ...CookieOptions,
                maxAge: 1000 * 60 * 60 * 24 * 365,
            });

            return res.json(new ApiResponse(200, "Tokens refreshed"));
        } catch (error) {
            next(error);
            return;
        }
    }

    async logout(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            await this.tokenService.deleteRefreshToken(Number(req.auth.id));
            this.logger.info("Refresh token deleted", { tokenId: req.auth.id });
            this.logger.info("User logged out", { userId: req.auth.sub });

            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");

            return res.json(new ApiResponse(200, "User logged out."));
        } catch (error) {
            next(error);
            return;
        }
    }
}
