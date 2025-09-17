import { PrismaClient } from "../../generated/prisma/index.js";
import { ITenantData, ITenantQueryParams } from "../types/index.js";

export default class TenantService {
    constructor(private tenant: PrismaClient["tenant"]) {}

    async create(tenantData: ITenantData) {
        return await this.tenant.create({
            data: tenantData,
        });
    }

    async listAll(validatedQuery: ITenantQueryParams) {
        const { q, currentPage, perPage } = validatedQuery;

        const whereClause = q
            ? {
                  OR: [
                      {
                          name: {
                              contains: q,
                              mode: "insensitive" as const,
                          },
                      },
                      {
                          address: {
                              contains: q,
                              mode: "insensitive" as const,
                          },
                      },
                  ],
              }
            : {};

        const [tenants, count] = await Promise.all([
            this.tenant.findMany({
                where: whereClause,
                skip: (currentPage - 1) * perPage,
                take: perPage,
                orderBy: { id: "desc" },
            }),
            this.tenant.count({ where: whereClause }),
        ]);

        return [tenants, count];
    }

    async getById(tenantId: number) {
        return await this.tenant.findFirst({ where: { id: tenantId } });
    }

    async update(tenantId: number, tenantData: ITenantData) {
        return await this.tenant.update({
            where: { id: tenantId },
            data: tenantData,
        });
    }

    async delete(tenantId: number) {
        await this.tenant.delete({
            where: { id: tenantId },
        });
    }
}
