import { Response, NextFunction } from "express";
import { Logger } from "winston";
import { TenantService } from "../services/index.js";
import { TenantRequest } from "../types";
import ApiResponse from "../utils/ApiResponse.js";

export default class TenantController {
    constructor(
        private tenantService: TenantService,
        private logger: Logger
    ) {}

    async create(req: TenantRequest, res: Response, next: NextFunction) {
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
}
