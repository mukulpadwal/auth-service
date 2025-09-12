import createJWKSMock from "mock-jwks";
import { DataSource } from "typeorm";
import {
    afterAll,
    afterEach,
    beforeAll,
    beforeEach,
    describe,
    expect,
    it,
} from "vitest";
import { AppDataSource } from "../../src/config/data-source";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/constants";
import { RefreshToken } from "../../src/entity/RefreshToken";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../src/app";
import { Config } from "../../src/config";

describe("POST /api/v1/auth/refresh", () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;

    // Will run once before executing the test cases
    beforeAll(async () => {
        jwks = createJWKSMock("http://localhost:8080/.well-known/jwks.json");
        connection = await AppDataSource.initialize();
    });

    // Will run before every test case
    beforeEach(async () => {
        jwks.start();
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterEach(() => {
        jwks.stop();
    });

    // Will run once after executing all the test cases
    afterAll(async () => {
        await connection.destroy();
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
        const userRepository = connection.getRepository(User);
        const user = await userRepository.save({
            ...userData,
            role: Roles.CUSTOMER,
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
        const userRepository = connection.getRepository(User);
        const user = await userRepository.save({
            ...userData,
            role: Roles.CUSTOMER,
        });

        const accessToken = jwks.token({
            sub: String(user.id),
            role: user.role,
        });

        const refreshTokenRepository = connection.getRepository(RefreshToken);
        const refreshTokenEntry = await refreshTokenRepository.save({
            user,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
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
        const userRepository = connection.getRepository(User);
        const user = await userRepository.save({
            ...userData,
            role: Roles.CUSTOMER,
        });

        const accessToken = jwks.token({
            sub: String(user.id),
            role: user.role,
        });

        const refreshTokenRepository = connection.getRepository(RefreshToken);
        const refreshTokenEntry = await refreshTokenRepository.save({
            user,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
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
