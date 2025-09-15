import {
    Router,
    type NextFunction,
    type Request,
    type Response,
} from "express";
import { AuthController } from "../controllers/index.js";
import logger from "../config/logger.js";
import { AuthRequest } from "../types/index.js";
import {
    authenticate,
    parseRefreshToken,
    validateRefreshToken,
} from "../middlewares/index.js";
import {
    CredentialService,
    TokenService,
    UserService,
} from "../services/index.js";
import { loginValidator, registerValidator } from "../validators/index.js";
import { prisma } from "../prisma.js";

const authRouter = Router();

// Flow :
// Tables are injected into Services
// Services are injected into controllers

// Services
const userService = new UserService(prisma.user);
const tokenService = new TokenService(prisma.refreshToken);
const credentialService = new CredentialService();

// Controller
const authController = new AuthController(
    userService,
    logger,
    tokenService,
    credentialService
);

authRouter.post(
    "/register",
    registerValidator,
    (req: Request, res: Response, next: NextFunction) =>
        authController.register(req, res, next)
);

authRouter.post(
    "/login",
    loginValidator,
    (req: Request, res: Response, next: NextFunction) =>
        authController.login(req, res, next)
);

authRouter.get("/self", authenticate, (req: Request, res: Response) =>
    authController.self(req as AuthRequest, res)
);

authRouter.post(
    "/refresh",
    validateRefreshToken,
    (req: Request, res: Response, next: NextFunction) =>
        authController.refresh(req as AuthRequest, res, next)
);

authRouter.post(
    "/logout",
    authenticate,
    parseRefreshToken,
    (req: Request, res: Response, next: NextFunction) =>
        authController.logout(req as AuthRequest, res, next)
);

export default authRouter;
