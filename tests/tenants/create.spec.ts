import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../utils";
import request from "supertest";
import app from "../../src/app";

describe("POST /api/v1/tenants", () => {
    beforeAll(async () => {
        await prisma.$connect();
    });

    beforeEach(async () => {
        await prisma.refreshToken.deleteMany({});
        await prisma.user.deleteMany({});
        await prisma.tenant.deleteMany({});
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
            const response = await request(app)
                .post("/api/v1/tenants")
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
    });
});
