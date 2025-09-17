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
import { Roles } from "../../src/constants";
import request from "supertest";
import app from "../../src/app";
import { prisma } from "../utils/index";

describe("POST /api/v1/users", () => {
    let jwks: ReturnType<typeof createJWKSMock>;

    // Will run once before executing the test cases
    beforeAll(async () => {
        jwks = createJWKSMock("http://localhost:8080/.well-known/jwks.json");
        await prisma.$connect();
    });

    // Will run before every test case
    beforeEach(async () => {
        jwks.start();
        await prisma.refreshToken.deleteMany({});
        await prisma.user.deleteMany({});
    });

    afterEach(() => {
        jwks.stop();
    });

    // Will run once after executing all the test cases
    afterAll(async () => {
        await prisma.$disconnect();
    });

    it("should return 201 status code", async () => {
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
            .post("/api/v1/users")
            .set("Cookie", [`accessToken=${accessToken}`])
            .send({ ...userData, tenantId: tenant.id, role: Roles.MANAGER });

        // Assert
        expect(response.statusCode).toBe(201);
    });

    it("should persist the user in database", async () => {
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

        await request(app)
            .post("/api/v1/users")
            .set("Cookie", [`accessToken=${accessToken}`])
            .send({ ...userData, tenantId: tenant.id, role: Roles.MANAGER });

        const users = await prisma.user.findMany({});

        // Act
        expect(users).toHaveLength(1);
        expect(users[0].email).toBe(userData.email);
    });

    it("should return MANAGER as the role of created user", async () => {
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

        await request(app)
            .post("/api/v1/users")
            .set("Cookie", [`accessToken=${accessToken}`])
            .send({ ...userData, tenantId: tenant.id, role: Roles.MANAGER });

        const users = await prisma.user.findMany({});

        // Act
        expect(users).toHaveLength(1);
        expect(users[0].role).toBe(Roles.MANAGER);
    });

    it("should return 403 status code for non ADMIN users trying to create a new user", async () => {
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
            .post("/api/v1/users")
            .set("Cookie", [`accessToken=${accessToken}`])
            .send({ ...userData, tenantId: tenant.id, role: Roles.MANAGER });

        // Act
        expect(response.statusCode).toBe(403);
    });

    it("should return 400 status code if email field is missing", async () => {
        // Arrange
        const userData = {
            firstName: "Mukul",
            lastName: "Padwal",
            age: 24,
            password: "strongpassword",
        };

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
            .post("/api/v1/users")
            .set("Cookie", [`accessToken=${accessToken}`])
            .send({ ...userData, tenantId: tenant.id, role: Roles.MANAGER });

        // Assert
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toHaveLength(1);
        expect(response.body.errors[0].message).toBe("Email is required!");
    });

    it("should return 400 status code if firstName is missing", async () => {
        // Arrange
        const userData = {
            lastName: "Padwal",
            email: "mukulpadwal.me@gmail.com",
            age: 24,
            password: "strongpassword",
        };

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
            .post("/api/v1/users")
            .set("Cookie", [`accessToken=${accessToken}`])
            .send({ ...userData, tenantId: tenant.id, role: Roles.MANAGER });

        // Assert
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toHaveLength(1);
        expect(response.body.errors[0].message).toBe("First name is required!");
    });

    it("should return 400 status code if lastName is missing", async () => {
        // Arrange
        const userData = {
            firstName: "Mukul",
            email: "mukulpadwal.me@gmail.com",
            age: 24,
            password: "strongpassword",
        };

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
            .post("/api/v1/users")
            .set("Cookie", [`accessToken=${accessToken}`])
            .send({ ...userData, tenantId: tenant.id, role: Roles.MANAGER });

        // Assert
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toHaveLength(1);
        expect(response.body.errors[0].message).toBe("Last name is required!");
    });

    it("should return 400 status code if role is missing", async () => {
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
            .post("/api/v1/users")
            .set("Cookie", [`accessToken=${accessToken}`])
            .send({ ...userData, tenantId: tenant.id });

        // Assert
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toHaveLength(1);
        expect(response.body.errors[0].message).toBe("Role is required!");
    });
});
