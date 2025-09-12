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
import request from "supertest";
import app from "../../src/app";
import { RefreshToken } from "../../src/entity/RefreshToken";
import jwt from "jsonwebtoken";
import { Config } from "../../src/config";

describe("POST /api/v1/auth/logout", () => {
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

        const refreshTokens = await refreshTokenRepository.find();

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
