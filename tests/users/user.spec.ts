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
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/constants";
import { createJWKSMock } from "mock-jwks";

describe("GET /api/v1/auth/self", () => {
    let connection: DataSource;
    let jwks;

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
        const userRepository = connection.getRepository(User);
        const user = await userRepository.save({
            ...userData,
            role: Roles.CUSTOMER,
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
        expect(response.body.id).toBe(user.id);
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
        const userRepository = connection.getRepository(User);
        const user = await userRepository.save({
            ...userData,
            role: Roles.CUSTOMER,
        });

        const accessToken = jwks.token({
            sub: user.id,
            role: user.role,
        });

        const response = await request(app)
            .get("/api/v1/auth/self")
            .set("Cookie", [`accessToken=${accessToken};`]);

        // Assert
        expect(response.body).not.toHaveProperty("password");
    });
});
