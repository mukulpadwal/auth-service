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
import jwt from "jsonwebtoken";
import app from "../../src/app";
import { prisma } from "../utils/index";
import { Config } from "../../src/config";

describe("POST /api/v1/auth/refresh", () => {
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

    it("should return 401 status code if refresh token is missing", async () => {
        // Arrange
        const userData = {
            firstName: "Mukul",
            lastName: "Padwal",
            email: "mukulpadwal.me@gmail.com",
            age: 24,
            password: "StrongPassword",
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

        const response = await request(app)
            .post("/api/v1/auth/refresh")
            .set("Cookie", [`accessToken=${accessToken}`])
            .send();

        //Assert
        expect(response.statusCode).toBe(401);
    });

    it("should return 401 status code if refresh token is invalid", async () => {
        // Arrange
        const userData = {
            firstName: "Mukul",
            lastName: "Padwal",
            email: "mukulpadwal.me@gmail.com",
            age: 24,
            password: "StrongPassword",
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
            .post("/api/v1/auth/refresh")
            .set("Cookie", [
                `accessToken=${accessToken}`,
                `refreshToken=${refreshToken};`,
            ])
            .send();

        //Assert
        expect(response.statusCode).toBe(401);
    });

    it("should check if the access and refresh token has been rotated", async () => {
        // Arrange
        const userData = {
            firstName: "Mukul",
            lastName: "Padwal",
            email: "mukulpadwal.me@gmail.com",
            age: 24,
            password: "StrongPassword",
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
            .post("/api/v1/auth/refresh")
            .set("Cookie", [
                `accessToken=${accessToken}`,
                `refreshToken=${refreshToken};`,
            ])
            .send();

        interface Headers {
            ["set-cookie"]: string[];
        }

        let newAccessToken: string | null = null;
        let newRefreshToken: string | null = null;

        const cookies =
            (response.headers as unknown as Headers)["set-cookie"] || [];

        cookies.forEach((cookie) => {
            if (cookie.startsWith("accessToken=")) {
                newAccessToken = cookie.split(";")[0].split("=")[1];
            }

            if (cookie.startsWith("refreshToken=")) {
                newRefreshToken = cookie.split(";")[0].split("=")[1];
            }
        });

        // Assert
        expect(newAccessToken).not.toBe(accessToken);
        expect(newRefreshToken).not.toBe(refreshToken);
        expect(response.statusCode).toBe(200);
    });
});
