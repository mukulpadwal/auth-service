import { NextFunction, Router, Request, Response } from "express";
import { TenantController } from "../controllers/index.js";
import { TenantService } from "../services/index.js";
import logger from "../config/logger.js";
import { prisma } from "../prisma.js";
import { authenticate, canAccess } from "../middlewares/index.js";
import { Roles } from "../constants/index.js";
import { listTenantValidator, tenantValidator } from "../validators/index.js";

const tenantRouter = Router();

// Flow :
// Tables are injected into Services
// Services are injected into controllers

// Services
const tenantService = new TenantService(prisma.tenant);

// Controller
const tenantController = new TenantController(tenantService, logger);

/**
 * POST /api/v1/tenants/
 * Create a new tenant.
 * Only ADMIN user is allowed to create a new tenant
 */
tenantRouter.post(
    "/",
    authenticate,
    canAccess([Roles.ADMIN]),
    tenantValidator,
    (req: Request, res: Response, next: NextFunction) =>
        tenantController.create(req, res, next)
);

/**
 * GET /api/v1/tenants/
 * List all the available tenants
 */
tenantRouter.get(
    "/",
    listTenantValidator,
    (req: Request, res: Response, next: NextFunction) =>
        tenantController.listAll(req, res, next)
);

/**
 * Get /api/v1/tenants/:tenantId
 * To get a tenant information with a given ID
 */
tenantRouter.get(
    "/:tenantId",
    authenticate,
    canAccess([Roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        tenantController.getById(req, res, next)
);

/**
 * PATCH /api/v1/tenants/:tenantId
 * To update a tenant information
 */
tenantRouter.patch(
    "/:tenantId",
    authenticate,
    canAccess([Roles.ADMIN]),
    tenantValidator,
    (req: Request, res: Response, next: NextFunction) =>
        tenantController.update(req, res, next)
);

/**
 * DELETE /api/v1/tenants/:tenantId
 * To delete a tenant
 */
tenantRouter.delete(
    "/:tenantId",
    authenticate,
    canAccess([Roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        tenantController.delete(req, res, next)
);

export default tenantRouter;
