import { Response, NextFunction } from "express";
import { Logger } from "winston";
import { TenantService } from "../services/index.js";
import { TenantRequest } from "../types";
import ApiResponse from "../utils/ApiResponse.js";
import { validationResult } from "express-validator";

export default class TenantController {
    constructor(
        private tenantService: TenantService,
        private logger: Logger
    ) {}

    async create(req: TenantRequest, res: Response, next: NextFunction) {
        // Validation
        const result = validationResult(req);

        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }

        const { name, address } = req.body;

        try {
            this.logger.debug("New request to create a tenant.", req.body);
            const tenant = await this.tenantService.create({ name, address });
            this.logger.debug("Tenant created successfuly.", tenant);

            res.status(201).json(
                new ApiResponse(200, "Tenant created successfully.", tenant)
            );
        } catch (error) {
            next(error);
            return;
        }
    }

    async list(req: TenantRequest, res: Response, next: NextFunction) {
        try {
            this.logger.debug("Request to list all the tenants");

            const tenants = await this.tenantService.listAll();

            return res.json(
                new ApiResponse(200, "Tenants data fetched.", tenants)
            );
        } catch (error) {
            next(error);
        }
    }

    async getById(req: TenantRequest, res: Response, next: NextFunction) {
        try {
            this.logger.info("Request to list tenant with is", {
                id: req.params.tenantId,
            });

            const tenant = await this.tenantService.getById(
                Number(req.params.tenantId)
            );

            return res.json(
                new ApiResponse(200, "Tenant data fetched.", tenant)
            );
        } catch (error) {
            next(error);
        }
    }
}
