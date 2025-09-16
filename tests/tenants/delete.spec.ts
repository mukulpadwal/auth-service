import createJWKSMock from "mock-jwks";
import {
    afterAll,
    afterEach,
    beforeAll,
    beforeEach,
    describe,
    expect,
    it,
} from "vitest";
import { prisma } from "../utils";
import { Roles } from "../../src/constants";
import request from "supertest";
import app from "../../src/app";

describe("DELETE /api/v1/tenants/:tenantId", () => {
    let jwks: ReturnType<typeof createJWKSMock>;

    beforeAll(async () => {
        jwks = createJWKSMock("http://localhost:8080/.well-known/jwks.json");
        await prisma.$connect();
    });

    beforeEach(async () => {
        await prisma.tenant.deleteMany({});
        jwks.start();
    });

    afterEach(() => {
        jwks.stop();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe("All the required fields are sent.", () => {
        it("should return 204 status code on success full deletion", async () => {
            // Arrange
            const tenantData = {
                name: "Tenant 1",
                address: "Tenant 1 Address",
            };

            // Act
            const tenant = await prisma.tenant.create({
                data: tenantData,
            });

            const accessToken = jwks.token({
                sub: "1",
                role: Roles.ADMIN,
            });

            const response = await request(app)
                .delete(`/api/v1/tenants/${tenant.id}`)
                .set("Cookie", [`accessToken=${accessToken}`]);

            const tenants = await prisma.tenant.findMany({});

            // Assert
            expect(response.statusCode).toBe(204);
            expect(tenants).toHaveLength(0);
        });

        it("should return 403 status code for non ADMIN users", async () => {
            // Arrange
            const tenantData = {
                name: "Tenant 1",
                address: "Tenant 1 Address",
            };

            // Act
            const tenant = await prisma.tenant.create({
                data: tenantData,
            });

            const accessToken = jwks.token({
                sub: "1",
                role: Roles.MANAGER,
            });

            const response = await request(app)
                .delete(`/api/v1/tenants/${tenant.id}`)
                .set("Cookie", [`accessToken=${accessToken}`]);

            // Assert
            expect(response.statusCode).toBe(403);
        });
    });
});
