import { PrismaClient } from "../../generated/prisma/index.js";
import { ITenantData } from "../types/index.js";

export default class TenantService {
    constructor(private tenant: PrismaClient["tenant"]) {}

    async create(tenantData: ITenantData) {
        return await this.tenant.create({
            data: tenantData,
        });
    }

    async listAll() {
        return await this.tenant.findMany({});
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
}
