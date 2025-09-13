import {
    describe,
    it,
    expect,
    beforeAll,
    beforeEach,
    afterAll,
    afterEach,
} from "vitest";
import request from "supertest";
import app from "../../src/app";
import { Roles } from "../../src/constants";
import { createJWKSMock } from "mock-jwks";
import { prisma } from "../utils/index";

describe("GET /api/v1/auth/self", () => {
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

    it("should return 200 status code", async () => {
        // Arrange

        // Act
        // Generate access token
        const accessToken = jwks.token({
            sub: "1",
            role: Roles.CUSTOMER,
        });

        const response = await request(app)
            .get("/api/v1/auth/self")
            .set("Cookie", [`accessToken=${accessToken};`])
            .send();

        // Assert
        expect(response.statusCode).toBe(200);
    });

    it("should verify the access token", async () => {
        // Arrange
        const userData = {
            firstName: "Mukul",
            lastName: "Padwal",
            email: "mukulpadwal.me@gmail.com",
            age: 24,
            password: "strongpassword",
        };

        // Act
        // Create new entry for the user
        const user = await prisma.user.create({
            data: {
                ...userData,
                role: Roles.CUSTOMER,
            },
        });

        // Generate access token
        const accessToken = jwks.token({
            sub: String(user.id),
            role: user.role,
        });

        const response = await request(app)
            .get("/api/v1/auth/self")
            .set("Cookie", [`accessToken=${accessToken};`])
            .send();

        // Assert
        expect(response.body.data.id).toBe(user.id);
    });

    it("should not return the password field in the response", async () => {
        // Arrange
        const userData = {
            firstName: "Mukul",
            lastName: "Padwal",
            email: "mukulpadwal.me@gmail.com",
            age: 24,
            password: "strongpassword",
        };

        // Act
        const user = await prisma.user.create({
            data: { ...userData, role: Roles.CUSTOMER },
        });

        const accessToken = jwks.token({
            sub: String(user.id),
            role: user.role,
        });

        const response = await request(app)
            .get("/api/v1/auth/self")
            .set("Cookie", [`accessToken=${accessToken};`]);

        // Assert
        expect(response.body).not.toHaveProperty("password");
    });

    it("should return 401 status code if no token is passed", async () => {
        // Arrange

        // Act
        const response = await request(app).get("/api/v1/auth/self").send();

        // Assert
        expect(response.statusCode).toBe(401);
    });
});
