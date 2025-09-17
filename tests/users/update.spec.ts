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

describe("PATCH /api/v1/users/:userId", async () => {
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

    describe("All required fields are present.", () => {
        it("should return 200 status code with updated information", async () => {
            // Arrange
            const userData = {
                firstName: "Mukul",
                lastName: "Padwal",
                email: "mukulpadwal.me@gmail.com",
                age: 24,
                password: "strongpassword",
            };

            const userDataToUpdate = {
                firstName: "MukulUpdated",
                lastName: "PadwalUpdated",
                email: userData.email,
                age: userData.age,
            };

            const tenantData = {
                name: "Tenant 1",
                address: "Tenant 1 Address",
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
                .patch(`/api/v1/users/${user.id}`)
                .set("Cookie", [`accessToken=${accessToken}`])
                .send({
                    ...userDataToUpdate,
                    role: Roles.MANAGER,
                    tenantId: tenant.id,
                });

            // Assert
            expect(response.status).toBe(200);
            expect(response.body.data.firstName).not.toBe(userData.firstName);
            expect(response.body.data.lastName).not.toBe(userData.lastName);
            expect(response.body.data.firstName).toBe(
                userDataToUpdate.firstName
            );
            expect(response.body.data.lastName).toBe(userDataToUpdate.lastName);
        });

        it("should return 403 status code for non ADMIN users", async () => {
            // Arrange
            const userData = {
                firstName: "Mukul",
                lastName: "Padwal",
                email: "mukulpadwal.me@gmail.com",
                age: 24,
                password: "strongpassword",
            };

            const userDataToUpdate = {
                firstName: "MukulUpdated",
                lastName: "PadwalUpdated",
            };

            const tenantData = {
                name: "Tenant 1",
                address: "Tenant 1 Address",
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
                .patch(`/api/v1/users/${user.id}`)
                .set("Cookie", [`accessToken=${accessToken}`])
                .send(userDataToUpdate);

            // Assert
            expect(response.statusCode).toBe(403);
        });
    });
});
