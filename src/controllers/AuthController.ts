import type { NextFunction, Response } from "express";

import type { RegisterUserRequest } from "../types";
import { UserService } from "../services/UserService";
import type { Logger } from "winston";
import { validationResult } from "express-validator";
import { JwtPayload } from "jsonwebtoken";
import { TokenService } from "../services/TokenService";

export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
        private tokenService: TokenService
    ) {}

    async register(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction
    ) {
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
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60,
                httpOnly: true,
            });

            res.cookie("refreshToken", refreshToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60 * 24 * 365,
                httpOnly: true,
            });

            return res.status(201).json({ id: user.id });
        } catch (error) {
            next(error);
            return;
        }
    }
}
