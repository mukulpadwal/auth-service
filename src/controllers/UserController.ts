import { Logger } from "winston";
import { UserService } from "../services/index.js";
import {
    IUserQueryParams,
    IUpdateUserRequest,
    IUserRequest,
} from "../types/index.js";
import { NextFunction, Response } from "express";
import ApiResponse from "../utils/ApiResponse.js";
import { matchedData, validationResult } from "express-validator";
import createHttpError from "http-errors";

export default class UserController {
    constructor(
        private userService: UserService,
        private logger: Logger
    ) {}

    async create(req: IUserRequest, res: Response, next: NextFunction) {
        // Validation
        const result = validationResult(req);

        if (!result.isEmpty()) {
            const error = createHttpError(400, result.array()[0].msg as string);
            next(error);
            return;
        }

        const { firstName, lastName, email, password, age, tenantId, role } =
            req.body;

        try {
            this.logger.debug("New request to create a new user", {
                firstName,
                lastName,
                email,
                password: "*******",
                age,
                tenantId,
                role,
            });

            const user = await this.userService.create({
                firstName,
                lastName,
                password,
                age,
                email,
                tenantId,
                role,
            });

            this.logger.debug("New user registered", { id: user.id });

            return res.status(201).json(
                new ApiResponse(201, "User successfully created", {
                    ...user,
                    password: undefined,
                })
            );
        } catch (error) {
            next(error);
        }
    }

    async listAll(req: IUserRequest, res: Response, next: NextFunction) {
        const validatedQuery = matchedData(req, { onlyValidData: true });

        try {
            this.logger.debug("Request to fetch all users");
            const [users, count] = await this.userService.listAll(
                validatedQuery as IUserQueryParams
            );
            this.logger.debug("Users fetched");

            res.status(200).json(
                new ApiResponse(200, "Users data fetched", {
                    users,
                    count,
                    currentPage: validatedQuery.currentPage as number,
                    perPage: validatedQuery.perPage as number,
                })
            );
        } catch (error) {
            next(error);
        }
    }

    async getById(req: IUserRequest, res: Response, next: NextFunction) {
        const { userId } = req.params;

        if (isNaN(Number(userId))) {
            const error = createHttpError(400, "Invalid URL param");
            next(error);
            return;
        }

        try {
            this.logger.debug("Request to fetch a user by id", { id: userId });
            const user = await this.userService.findById(Number(userId));
            this.logger.debug("User with id fetched", user);

            if (!user) {
                const error = createHttpError(400, "No user found");
                next(error);
                return;
            }

            res.status(200).json(
                new ApiResponse(200, "User data fetched.", user)
            );
        } catch (error) {
            next(error);
        }
    }

    async update(req: IUpdateUserRequest, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }

        const { userId } = req.params;

        if (isNaN(Number(userId))) {
            const error = createHttpError(400, "Invalid URL param");
            next(error);
            return;
        }

        const { firstName, lastName, email, age, role, tenantId } = req.body;

        try {
            this.logger.debug("Request to update user information with id", {
                id: userId,
            });
            const updatedUser = await this.userService.update(Number(userId), {
                firstName,
                lastName,
                email,
                age,
                role,
                tenantId,
            });

            this.logger.debug("User updated.", { id: userId });

            res.status(200).json(
                new ApiResponse(200, "User Updates Successfully.", updatedUser)
            );
        } catch (error) {
            next(error);
        }
    }

    async delete(req: IUserRequest, res: Response, next: NextFunction) {
        const { userId } = req.params;

        if (isNaN(Number(userId))) {
            const error = createHttpError(400, "Invalid URL param");
            next(error);
            return;
        }

        try {
            this.logger.debug("Request to delete user with id", {
                id: userId,
            });
            await this.userService.delete(Number(userId));
            this.logger.debug("Tenant deleted.", { id: userId });

            res.status(204).json(new ApiResponse(204, "User deleted."));
        } catch (error) {
            next(error);
        }
    }
}
