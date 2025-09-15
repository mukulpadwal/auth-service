import { PrismaClient } from "../../generated/prisma";
import { ITenantData } from "../types";

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
}
