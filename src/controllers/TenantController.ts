import { Response, NextFunction } from "express";
import { Logger } from "winston";
import { TenantService } from "../services/index.js";
import { TenantRequest } from "../types/index.js";
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

    async update(req: TenantRequest, res: Response, next: NextFunction) {
        const { tenantId } = req.params;
        const { name, address } = req.body;

        try {
            this.logger.debug("Request to update tenant information with id", {
                id: tenantId,
            });
            const updatedTenant = await this.tenantService.update(
                Number(tenantId),
                { name, address }
            );
            this.logger.debug("Tenant updated.", updatedTenant);

            res.status(200).json(
                new ApiResponse(
                    200,
                    "Tenant Updates Successfully.",
                    updatedTenant
                )
            );
        } catch (error) {
            next(error);
        }
    }

    async delete(req: TenantRequest, res: Response, next: NextFunction) {
        const { tenantId } = req.params;
        try {
            this.logger.debug("Request to delete tenant with id", {
                id: tenantId,
            });
            await this.tenantService.delete(Number(tenantId));
            this.logger.debug("Tenant deleted.", { id: tenantId });

            res.status(204).json(new ApiResponse(204, "Tenant deleted."));
        } catch (error) {
            next(error);
        }
    }
}
