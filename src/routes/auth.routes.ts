import {
    Router,
    type NextFunction,
    type Request,
    type Response,
} from "express";
import { AuthController } from "../controllers/AuthController";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import logger from "../config/logger";
import { RefreshToken } from "../entity/RefreshToken";
import { AuthRequest } from "../types";
import {
    authenticate,
    parseRefreshToken,
    validateRefreshToken,
} from "../middlewares";
import { CredentialService, TokenService, UserService } from "../services";
import { loginValidator, registerValidator } from "../validators";

const authRouter = Router();

// Flow :
// Repositories are injected into Services
// Services are injected into controllers

// Repositories
const userRepository = AppDataSource.getRepository(User);
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);

// Services
const userService = new UserService(userRepository);
const tokenService = new TokenService(refreshTokenRepository);
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
