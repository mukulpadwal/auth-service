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
import request from "supertest";
import app from "../../src/app";
import { Roles } from "../../src/constants";

describe("PATCH /api/v1/tenants/:tenantId", async () => {
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

    describe("All required fields are present.", () => {
        it("should return 200 status code with updated information", async () => {
            // Arrange
            const tenantData = {
                name: "Tenant 1",
                address: "Tenant 1 Address",
            };

            const tenantDataToUpdate = {
                name: "Updated Tenant 1",
                address: tenantData.address,
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
                .patch(`/api/v1/tenants/${tenant.id}`)
                .set("Cookie", [`accessToken=${accessToken}`])
                .send(tenantDataToUpdate);

            // Assert
            expect(response.status).toBe(200);
            expect(response.body.data.name).not.toBe(tenantData.name);
            expect(response.body.data.name).toBe(tenantDataToUpdate.name);
        });

        it("should return 403 status code for non ADMIN users", async () => {
            // Arrange
            const tenantData = {
                name: "Tenant 1",
                address: "Tenant 1 Address",
            };

            const tenantDataToUpdate = {
                name: "Updated Tenant 1",
                address: tenantData.address,
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
                .patch(`/api/v1/tenants/${tenant.id}`)
                .set("Cookie", [`accessToken=${accessToken}`])
                .send(tenantDataToUpdate);

            // Assert
            expect(response.statusCode).toBe(403);
        });
    });
});
