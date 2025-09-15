import { Router } from "express";
import { TenantController } from "../controllers/index.js";
import { TenantService } from "../services/index.js";
import logger from "../config/logger.js";
import { prisma } from "../prisma.js";

const tenantRouter = Router();

// Flow :
// Tables are injected into Services
// Services are injected into controllers

// Services
const tenantService = new TenantService(prisma.tenant);

// Controller
const tenantController = new TenantController(tenantService, logger);

tenantRouter.post("/", (req, res, next) =>
    tenantController.create(req, res, next)
);

export default tenantRouter;
