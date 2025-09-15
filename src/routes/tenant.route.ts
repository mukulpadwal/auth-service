import { NextFunction, Router, Request, Response } from "express";
import { TenantController } from "../controllers/index.js";
import { TenantService } from "../services/index.js";
import logger from "../config/logger.js";
import { prisma } from "../prisma.js";
import { authenticate, canAccess } from "../middlewares/index.js";
import { Roles } from "../constants/index.js";
import { tenantValidator } from "../validators/index.js";

const tenantRouter = Router();

// Flow :
// Tables are injected into Services
// Services are injected into controllers

// Services
const tenantService = new TenantService(prisma.tenant);

// Controller
const tenantController = new TenantController(tenantService, logger);

tenantRouter.post(
    "/",
    tenantValidator,
    authenticate,
    canAccess([Roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        tenantController.create(req, res, next)
);

tenantRouter.get(
    "/",
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    (req: Request, res: Response, next: NextFunction) =>
        tenantController.list(req, res, next)
);

tenantRouter.get(
    "/:tenantId",
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    (req: Request, res: Response, next: NextFunction) =>
        tenantController.getById(req, res, next)
);

export default tenantRouter;
