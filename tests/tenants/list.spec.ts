import {
    afterAll,
    afterEach,
    beforeAll,
    beforeEach,
    describe,
    expect,
    it,
} from "vitest";
import request from "supertest";
import app from "../../src/app";
import createJWKSMock from "mock-jwks";
import { prisma } from "../utils";
import { Roles } from "../../src/constants";

describe("GET /api/v1", () => {
    let jwks: ReturnType<typeof createJWKSMock>;

    beforeAll(async () => {
        jwks = createJWKSMock("http://localhost:8080/.well-known/jwks.json");
        await prisma.$connect();
    });

    beforeEach(async () => {
        jwks.start();
        await prisma.tenant.deleteMany({});
    });

    afterEach(() => {
        jwks.stop();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe("/tenants", () => {
        it("should return 200 status code", async () => {
            // Arrange

            // Act
            const accessToken = jwks.token({
                sub: "1",
                role: Roles.ADMIN,
            });

            const response = await request(app)
                .get("/api/v1/tenants")
                .set("Cookie", [`accessToken=${accessToken};`]);

            // Assert
            expect(response.statusCode).toBe(200);
        });

        it("should return an array of length 2", async () => {
            // Arrange
            const tenantData = [
                {
                    name: "Tenant 1",
                    address: "Tenant 1 Address",
                },
                {
                    name: "Tenant 2",
                    address: "Tenant 2 Address",
                },
            ];

            // Act
            await prisma.tenant.createMany({
                data: tenantData,
            });

            const accessToken = jwks.token({
                sub: "1",
                role: Roles.ADMIN,
            });

            const response = await request(app)
                .get("/api/v1/tenants")
                .set("Cookie", [`accessToken=${accessToken};`]);

            // Assert
            expect(response.statusCode).toBe(200);
            expect(response.body.data.tenants).toHaveLength(2);
            expect(response.body.data.count).toBe(2);
        });

        it("should return an array with Tenant 1 and count as 1", async () => {
            // Arrange
            const tenantData = [
                {
                    name: "Tenant 1",
                    address: "Tenant 1 Address",
                },
                {
                    name: "Tenant 2",
                    address: "Tenant 2 Address",
                },
            ];

            // Act
            await prisma.tenant.createMany({
                data: tenantData,
            });

            const accessToken = jwks.token({
                sub: "1",
                role: Roles.ADMIN,
            });

            const response = await request(app)
                .get("/api/v1/tenants?q=Tenant%201")
                .set("Cookie", [`accessToken=${accessToken};`]);

            // Assert
            expect(response.statusCode).toBe(200);
            expect(response.body.data.tenants[0].name).toBe("Tenant 1");
            expect(response.body.data.tenants).toHaveLength(1);
            expect(response.body.data.count).toBe(1);
        });
    });

    describe("/tenants/:tenantId", () => {
        it("should return 200 status code", async () => {
            // Arrange
            const tenantData = {
                name: "Test Tenant 1",
                address: "Test Tenant 1 Address",
            };

            // Act
            const accessToken = jwks.token({
                sub: "1",
                role: Roles.ADMIN,
            });

            const tenant = await prisma.tenant.create({
                data: tenantData,
            });

            const response = await request(app)
                .get(`/api/v1/tenants/${tenant.id}`)
                .set("Cookie", [`accessToken=${accessToken};`])
                .send();

            // Assert
            expect(response.statusCode).toBe(200);
            expect(response.body?.data?.id).toBe(tenant.id);
            expect(response.body?.data?.name).toBe(tenant.name);
            expect(response.body?.data?.address).toBe(tenant.address);
        });

        it("should return 403 for non authorized user", async () => {
            // Arrange
            const tenantData = {
                name: "Test Tenant 1",
                address: "Test Tenant 1 Address",
            };

            // Act
            const accessToken = jwks.token({
                sub: "1",
                role: Roles.CUSTOMER,
            });

            const tenant = await prisma.tenant.create({
                data: tenantData,
            });

            const response = await request(app)
                .get(`/api/v1/tenants/${tenant.id}`)
                .set("Cookie", [`accessToken=${accessToken}`]);

            // Assert
            expect(response.statusCode).toBe(403);
        });
    });
});
