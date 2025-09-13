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
import jwt from "jsonwebtoken";
import { Config } from "../../src/config";
import { prisma } from "../utils/index";

describe("POST /api/v1/auth/logout", () => {
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

    it("should return 401 if the user is not authenticated", async () => {
        // Arrange

        // Act
        const response = await request(app)
            .post("/api/v1/auth/logout")
            .set("Cookie", [``]);

        // Assert
        expect(response.statusCode).toBe(401);
    });

    it("should clear all the cookies and remove the refresh token from the database", async () => {
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
            data: {
                ...userData,
                role: Roles.CUSTOMER,
            },
        });

        const accessToken = jwks.token({
            sub: String(user.id),
            role: user.role,
        });

        const refreshTokenEntry = await prisma.refreshToken.create({
            data: {
                user: { connect: { id: user.id } },
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
            },
        });

        const refreshToken = jwt.sign(
            {
                sub: String(user.id),
                role: user.role,
                id: String(refreshTokenEntry.id),
            },
            Config.JWT_REFRESH_TOKEN_SECRET!,
            {
                algorithm: "HS256",
                expiresIn: "1y",
                issuer: "auth-service",
                jwtid: String(refreshTokenEntry.id),
            }
        );

        const response = await request(app)
            .post("/api/v1/auth/logout")
            .set("Cookie", [
                `accessToken=${accessToken}; refreshToken=${refreshToken};`,
            ])
            .send();

        const refreshTokens = await prisma.refreshToken.findMany();

        interface Headers {
            ["set-cookie"]: string[];
        }

        const cookies =
            (response.headers as unknown as Headers)["set-cookie"] || [];

        // Assert
        expect(refreshTokens).toHaveLength(0);
        expect(cookies[0].split(";")[0].split("=")[1]).toBe("");
        expect(cookies[1].split(";")[0].split("=")[1]).toBe("");
        expect(response.statusCode).toBe(200);
    });
});
