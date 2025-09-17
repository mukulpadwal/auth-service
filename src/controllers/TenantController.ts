import { Response, NextFunction } from "express";
import { Logger } from "winston";
import { TenantService } from "../services/index.js";
import { ITenantQueryParams, TenantRequest } from "../types/index.js";
import ApiResponse from "../utils/ApiResponse.js";
import { matchedData, validationResult } from "express-validator";
import createHttpError from "http-errors";

export default class TenantController {
    constructor(
        private tenantService: TenantService,
        private logger: Logger
    ) {}

    async create(req: TenantRequest, res: Response, next: NextFunction) {
        // Validation
        const result = validationResult(req);

        if (!result.isEmpty()) {
            return res
                .status(400)
                .json(
                    new ApiResponse(
                        200,
                        "Validation Error",
                        null,
                        result.array()
                    )
                );
        }

        const { name, address } = req.body;

        try {
            this.logger.debug("New request to create a tenant.", req.body);

            const tenant = await this.tenantService.create({ name, address });

            this.logger.debug("Tenant created successfuly.", tenant.id);

            res.status(201).json(
                new ApiResponse(200, "Tenant created successfully.", tenant)
            );
        } catch (error) {
            next(error);
            return;
        }
    }

    async listAll(req: TenantRequest, res: Response, next: NextFunction) {
        const validatedQuery = matchedData(req, { onlyValidData: true });

        try {
            this.logger.debug("Request to list all the tenants");

            const [tenants, count] = await this.tenantService.listAll(
                validatedQuery as ITenantQueryParams
            );

            return res.json(
                new ApiResponse(200, "Tenants data fetched.", {
                    tenants,
                    count,
                    currentPage: validatedQuery.currentPage as number,
                    perPage: validatedQuery.perPage as number,
                })
            );
        } catch (error) {
            next(error);
            return;
        }
    }

    async getById(req: TenantRequest, res: Response, next: NextFunction) {
        const { tenantId } = req.params;

        if (isNaN(Number(tenantId))) {
            const error = createHttpError(400, "Invalid URL param");
            next(error);
            return;
        }

        try {
            this.logger.info("Request to list tenant with is", {
                id: tenantId,
            });

            const tenant = await this.tenantService.getById(Number(tenantId));

            if (!tenant) {
                const error = createHttpError(400, "Tenant does not exist.");
                next(error);
                return;
            }

            return res.json(
                new ApiResponse(200, "Tenant data fetched.", tenant)
            );
        } catch (error) {
            next(error);
            return;
        }
    }

    async update(req: TenantRequest, res: Response, next: NextFunction) {
        // Validation
        const result = validationResult(req);

        if (!result.isEmpty()) {
            return res
                .status(400)
                .json(
                    new ApiResponse(
                        200,
                        "Validation Error",
                        null,
                        result.array()
                    )
                );
        }

        const { tenantId } = req.params;
        const { name, address } = req.body;

        if (isNaN(Number(tenantId))) {
            const error = createHttpError(400, "Invalid URL param");
            next(error);
            return;
        }

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
            return;
        }
    }

    async delete(req: TenantRequest, res: Response, next: NextFunction) {
        const { tenantId } = req.params;

        if (isNaN(Number(tenantId))) {
            const error = createHttpError(400, "Invalid URL param");
            next(error);
            return;
        }

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
