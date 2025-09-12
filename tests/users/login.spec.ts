import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import request from "supertest";
import app from "../../src/app";
import { User } from "../../src/entity/User";
import { isJwt } from "../utils";

describe("POST /api/vi/auth/login", () => {
    let connection: DataSource;

    // Will run once before executing the test cases
    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    // Will run before every test case
    beforeEach(async () => {
        await connection.dropDatabase();
        await connection.synchronize();
    });

    // Will run once after executing all the test cases
    afterAll(async () => {
        await connection.destroy();
    });

    describe("All the necessary fields are provided.", () => {
        it("should return 200 status code", async () => {
            // Arrange
            const userData = {
                firstName: "Mukul",
                lastName: "Padwal",
                age: 24,
                email: "mukulpadwal.me@gmail.com",
                password: "strongpassword",
            };

            // Act
            await request(app).post("/api/v1/auth/register").send(userData);

            const response = await request(app)
                .post("/api/v1/auth/login")
                .send({ email: userData.email, password: userData.password });

            // Assert
            expect(response.statusCode).toBe(200);
        });

        it("should return a valid JSON response", async () => {
            // Arrange
            const userData = {
                firstName: "Mukul",
                lastName: "Padwal",
                age: 24,
                email: "mukulpadwal.me@gmail.com",
                password: "strongpassword",
            };

            // Act
            await request(app).post("/api/v1/auth/register").send(userData);

            const response = await request(app)
                .post("/api/v1/auth/login")
                .send({ email: userData.email, password: userData.password });

            // Assert
            expect(response.headers["content-type"]).toEqual(
                expect.stringContaining("json")
            );
        });

        it("should return id of the logged in user", async () => {
            // Arrange
            const userData = {
                firstName: "Mukul",
                lastName: "Padwal",
                age: 24,
                email: "mukulpadwal.me@gmail.com",
                password: "strongpassword",
            };

            // Act
            await request(app).post("/api/v1/auth/register").send(userData);

            const response = await request(app)
                .post("/api/v1/auth/login")
                .send({ email: userData.email, password: userData.password });

            // Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            expect(users[0].id).toBe(response.body.data.id);
        });

        it("should return 400 status code for incorrect password", async () => {
            // Arrange
            const userData = {
                firstName: "Mukul",
                lastName: "Padwal",
                age: 24,
                email: "mukulpadwal.me@gmail.com",
                password: "strongpassword",
            };

            // Act
            await request(app).post("/api/v1/auth/register").send(userData);

            const response = await request(app)
                .post("/api/v1/auth/login")
                .send({ email: userData.email, password: "incorrectpassword" });

            // Assert
            expect(response.statusCode).toBe(400);
        });

        it("should return 400 status status code for incorrect email.", async () => {
            // Arrange
            const userData = {
                firstName: "Mukul",
                lastName: "Padwal",
                age: 24,
                email: "mukulpadwal.me@gmail.com",
                password: "strongpassword",
            };

            // Act
            await request(app).post("/api/v1/auth/register").send(userData);

            const response = await request(app)
                .post("/api/v1/auth/login")
                .send({
                    email: "incorrectemail@gmail.com",
                    password: userData.password,
                });

            // Assert
            expect(response.statusCode).toBe(400);
        });

        it("should return the access token and refresh token inside a cookie", async () => {
            // Arrange
            const userData = {
                firstName: "Mukul",
                lastName: "Padwal",
                age: 24,
                email: "mukulpadwal.me@gmail.com",
                password: "strongpassword",
            };

            // Act
            await request(app).post("/api/v1/auth/register").send(userData);

            const response = await request(app)
                .post("/api/v1/auth/login")
                .send({ email: userData.email, password: userData.password });

            interface Headers {
                ["set-cookie"]: string[];
            }

            // Assert
            let accessToken: string | null = null;
            let refreshToken: string | null = null;

            const cookies =
                (response.headers as unknown as Headers)["set-cookie"] || [];

            cookies.forEach((cookie) => {
                if (cookie.startsWith("accessToken=")) {
                    accessToken = cookie.split(";")[0].split("=")[1];
                }

                if (cookie.startsWith("refreshToken=")) {
                    refreshToken = cookie.split(";")[0].split("=")[1];
                }
            });

            expect(accessToken).not.toBeNull();
            expect(refreshToken).not.toBeNull();

            // Check the format of the tokens
            expect(isJwt(accessToken)).toBeTruthy();
            expect(isJwt(refreshToken)).toBeTruthy();
        });
    });

    describe("Few required fields are missing.", () => {
        it("should return 400 status code if email field is missing", async () => {
            // Arrange
            const userData = {
                password: "strongpassword",
            };

            // Act
            const response = await request(app)
                .post("/api/v1/auth/login")
                .send(userData);

            // Assert
            expect(response.statusCode).toBe(400);
        });

        it("should return 400 status code if password field is missing.", async () => {
            // Arrange
            const userData = {
                email: "mukulpadwal.me@gmail.com",
            };

            // Act
            const response = await request(app)
                .post("/api/v1/auth/login")
                .send(userData);

            // Assert
            expect(response.statusCode).toBe(400);
        });
    });

    describe("Fields are not in proper format.", () => {
        it("should return an array of error messages if the email is missing", async () => {
            // Arrange
            const userData = {
                email: "",
                password: "strongpassword",
            };

            // Act
            const response = await request(app)
                .post("/api/v1/auth/login")
                .send(userData);

            // Assert
            expect(response.body).toHaveProperty("errors");
            expect(response.body.errors).not.toHaveLength(0);
            expect(response.body.errors.length).toBeGreaterThan(0);
            expect(response.body.errors[0]).toHaveProperty("msg");
            expect(response.body.errors[0].msg).toBe("Email is required.");
        });
    });
});
