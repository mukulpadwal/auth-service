import type { Response } from "express";

import type { RegisterUserRequest } from "../types";
import { UserService } from "../services/UserService";

export class AuthController {
    userService: UserService;

    constructor(userService: UserService) {
        this.userService = userService;
    }

    async register(req: RegisterUserRequest, res: Response) {
        const { firstName, lastName, password, age, email } = req.body;

        await this.userService.create({
            firstName,
            lastName,
            password,
            age,
            email,
        });

        return res.status(201).json({});
    }
}
