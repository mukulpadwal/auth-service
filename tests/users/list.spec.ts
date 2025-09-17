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
        await prisma.user.deleteMany({});
    });

    afterEach(() => {
        jwks.stop();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe("/users", () => {
        it("should return 200 status code", async () => {
            // Arrange

            // Act
            const accessToken = jwks.token({
                sub: "1",
                role: Roles.ADMIN,
            });

            const response = await request(app)
                .get("/api/v1/users")
                .set("Cookie", [`accessToken=${accessToken};`]);

            // Assert
            expect(response.statusCode).toBe(200);
        });

        it("should return 403 for non authorized users", async () => {
            // Arrange

            // Act
            const accessToken = jwks.token({
                sub: "1",
                role: Roles.CUSTOMER,
            });

            const response = await request(app)
                .get("/api/v1/users")
                .set("Cookie", [`accessToken=${accessToken};`]);

            // Assert
            expect(response.statusCode).toBe(403);
        });

        it("should return an array of length 1", async () => {
            // Arrange
            const userData = {
                firstName: "Mukul",
                lastName: "Padwal",
                email: "mukulpadwal.me@gmail.com",
                age: 24,
                password: "strongpassword",
            };

            const tenantData = {
                name: "Tenant 1",
                address: "Teanant 1 Address",
            };

            // Act
            const tenant = await prisma.tenant.create({
                data: tenantData,
            });

            await prisma.user.create({
                data: {
                    ...userData,
                    role: Roles.MANAGER,
                    tenantId: tenant.id,
                },
            });

            const accessToken = jwks.token({
                sub: "1",
                role: Roles.ADMIN,
            });

            const response = await request(app)
                .get("/api/v1/users")
                .set("Cookie", [`accessToken=${accessToken};`]);

            // Assert
            expect(response.statusCode).toBe(200);
            expect(response.body.data.users).toHaveLength(1);
            expect(response.body.data.count).toBe(1);
        });
    });

    describe("/users/:userId", () => {
        it("should return 200 status code", async () => {
            // Arrange
            const userData = {
                firstName: "Mukul",
                lastName: "Padwal",
                email: "mukulpadwal.me@gmail.com",
                age: 24,
                password: "strongpassword",
            };

            const tenantData = {
                name: "Tenant 1",
                address: "Teanant 1 Address",
            };

            // Act
            const tenant = await prisma.tenant.create({
                data: tenantData,
            });

            const user = await prisma.user.create({
                data: {
                    ...userData,
                    role: Roles.MANAGER,
                    tenantId: tenant.id,
                },
            });

            const accessToken = jwks.token({
                sub: "1",
                role: Roles.ADMIN,
            });

            const response = await request(app)
                .get(`/api/v1/users/${user.id}`)
                .set("Cookie", [`accessToken=${accessToken};`])
                .send();

            // Assert
            expect(response.statusCode).toBe(200);
            expect(response.body?.data?.id).toBe(user.id);
            expect(response.body?.data?.firstName).toBe(user.firstName);
            expect(response.body?.data?.tenantId).toBe(user.tenantId);
        });

        it("should return 403 for non authorized user", async () => {
            // Arrange
            const userData = {
                firstName: "Mukul",
                lastName: "Padwal",
                email: "mukulpadwal.me@gmail.com",
                age: 24,
                password: "strongpassword",
            };

            const tenantData = {
                name: "Tenant 1",
                address: "Teanant 1 Address",
            };

            // Act
            const tenant = await prisma.tenant.create({
                data: tenantData,
            });

            const user = await prisma.user.create({
                data: {
                    ...userData,
                    role: Roles.MANAGER,
                    tenantId: tenant.id,
                },
            });

            const accessToken = jwks.token({
                sub: "1",
                role: Roles.MANAGER,
            });

            const response = await request(app)
                .get(`/api/v1/users/${user.id}`)
                .set("Cookie", [`accessToken=${accessToken};`])
                .send();

            // Assert
            expect(response.statusCode).toBe(403);
        });
    });
});
