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
import createJWKSMock from "mock-jwks";
import { Roles } from "../../src/constants";

describe("POST /api/v1/tenants", () => {
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

    describe("All the necessary fields are provided.", () => {
        it("should save the tenant data and return 201 status code", async () => {
            // Arrange
            const tenantData = {
                name: "Test Tenant 1",
                address: "Test Tenant 1 Address",
            };

            // Act
            const adminAccessToken = jwks.token({
                sub: "1",
                role: Roles.ADMIN,
            });

            const response = await request(app)
                .post("/api/v1/tenants")
                .set("Cookie", [`accessToken=${adminAccessToken};`])
                .send(tenantData);

            // Assert
            expect(response.statusCode).toBe(201);
            expect(response.body?.data?.name).toBe(tenantData.name);
            expect(response.body?.data?.address).toBe(tenantData.address);
        });

        it("should save the tenant information in the database", async () => {
            // Arrange
            const tenantData = {
                name: "Test Tenant 1",
                address: "Test Tenant 1 Address",
            };

            // Act
            const tenant = await prisma.tenant.create({
                data: tenantData,
            });

            // Assert
            expect(tenant.name).toBe(tenantData.name);
            expect(tenant.address).toBe(tenantData.address);
        });

        it("should return 401 if user is not authenticated", async () => {
            // Arrange
            const tenantData = {
                name: "Test Tenant 1",
                address: "Test Tenant 1 Address",
            };

            // Act
            const response = await request(app)
                .post("/api/v1/tenants")
                .send(tenantData);

            // Assert
            expect(response.statusCode).toBe(401);
        });

        it("should return 403 if the user is not an ADMIN", async () => {
            // Arrange
            const tenantData = {
                name: "Test Tenant 1",
                address: "Test Tenant 1 Address",
            };

            // Act
            const managerAccessToken = jwks.token({
                sub: "1",
                role: Roles.MANAGER,
            });

            const response = await request(app)
                .post("/api/v1/tenants")
                .set("Cookie", [`accessToken=${managerAccessToken};`])
                .send(tenantData);

            // Assert
            expect(response.statusCode).toBe(403);
        });
    });
});
