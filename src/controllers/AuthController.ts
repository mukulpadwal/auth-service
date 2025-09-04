import type { NextFunction, Response } from "express";

import type { RegisterUserRequest } from "../types";
import { UserService } from "../services/UserService";
import type { Logger } from "winston";

export class AuthController {
    userService: UserService;

    constructor(
        userService: UserService,
        private logger: Logger
    ) {
        this.userService = userService;
    }

    async register(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction
    ) {
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
            return res.status(201).json({ id: user.id });
        } catch (error) {
            next(error);
            return;
        }
    }
}
