import {
    Router,
    type NextFunction,
    type Request,
    type Response,
} from "express";
import { AuthController } from "../controllers/AuthController";
import { UserService } from "../services/UserService";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import logger from "../config/logger";
import registerValidator from "../validators/register-validator";
import { TokenService } from "../services/TokenService";
import { RefreshToken } from "../entity/RefreshToken";
import loginValidator from "../validators/login-validator";
import { CredentialService } from "../services/CredentialService";

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

export default authRouter;
