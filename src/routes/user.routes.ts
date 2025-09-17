import { NextFunction, Router, Request, Response } from "express";
import { UserService } from "../services/index.js";
import { prisma } from "../prisma.js";
import { UserController } from "../controllers/index.js";
import logger from "../config/logger.js";
import { authenticate, canAccess } from "../middlewares/index.js";
import { Roles } from "../constants/index.js";
import {
    createUservalidtor,
    listUserValidator,
    updateUserValidator,
} from "../validators/index.js";

const userRouter = Router();

const userService = new UserService(prisma.user);
const userController = new UserController(userService, logger);

/**
 * POST /api/v1/users/
 */
userRouter.post(
    "/",
    authenticate,
    canAccess([Roles.ADMIN]),
    createUservalidtor,
    (req: Request, res: Response, next: NextFunction) =>
        userController.create(req, res, next)
);

userRouter.get(
    "/",
    authenticate,
    canAccess([Roles.ADMIN]),
    listUserValidator,
    (req: Request, res: Response, next: NextFunction) =>
        userController.listAll(req, res, next)
);

userRouter.get(
    "/:userId",
    authenticate,
    canAccess([Roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        userController.getById(req, res, next)
);

userRouter.patch(
    "/:userId",
    authenticate,
    canAccess([Roles.ADMIN]),
    updateUserValidator,
    (req: Request, res: Response, next: NextFunction) =>
        userController.update(req, res, next)
);

userRouter.delete(
    "/:userId",
    authenticate,
    canAccess([Roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        userController.delete(req, res, next)
);

export default userRouter;
