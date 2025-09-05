import request from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/constants";

// Used to group multiple test cases
describe("POST /auth/register", () => {
    let connection: DataSource;

    // Will run once before executing the test cases
    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    // Will run before every test case
    beforeEach(async () => {
        // Database truncate
        await connection.dropDatabase();
        await connection.synchronize();
    });

    // Will run once after executing all the test cases
    afterAll(async () => {
        await connection.destroy();
    });

    // Happy path
    describe("All the necessary fields are provided.", () => {
        it("should return 201 status code", async () => {
            // Arrange: Collect all the required data
            const userData = {
                firstName: "Mukul",
                lastName: "Padwal",
                age: 24,
                email: "mukulpadwal.me@gmail.com",
                password: "strongpassword",
            };

            // Act: Trigger the test
            const response = await request(app)
                .post("/api/v1/auth/register")
                .send(userData);

            // Assert: Check the result
            expect(response.statusCode).toBe(201);
        });

        it("should return valid JSON response", async () => {
            // Arrange
            const userData = {
                firstName: "Mukul",
                lastName: "Padwal",
                age: 24,
                email: "mukulpadwal.me@gmail.com",
                password: "strongpassword",
            };

            // Act
            const response = await request(app)
                .post("/api/v1/auth/register")
                .send(userData);

            // Assert
            expect(response.headers["content-type"]).toEqual(
                expect.stringContaining("json")
            );
        });

        it("should persist the user in the database", async () => {
            // Arrange
            const userData = {
                firstName: "Mukul",
                lastName: "Padwal",
                age: 24,
                email: "mukulpadwal.me@gmail.com",
                password: "strongpassword",
            };

            // Act
            const response = await request(app)
                .post("/api/v1/auth/register")
                .send(userData);

            // Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            expect(users).toHaveLength(1);
            expect(users[0].firstName).toBe(userData.firstName);
            expect(users[0].lastName).toBe(userData.lastName);
            expect(users[0].age).toBe(userData.age);
            expect(users[0].email).toBe(userData.email);
        });

        it("should return id of the created user", async () => {
            // Arrange
            const userData = {
                firstName: "Mukul",
                lastName: "Padwal",
                age: 24,
                email: "mukulpadwal.me@gmail.com",
                password: "strongpassword",
            };

            // Act
            const response = await request(app)
                .post("/api/v1/auth/register")
                .send(userData);

            // Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            expect(users[0].id).toEqual(response.body.id);
        });

        it("should assign customer role to the registered user", async () => {
            // Arrange
            const userData = {
                firstName: "Mukul",
                lastName: "Padwal",
                age: 24,
                email: "mukulpadwal.me@gmail.com",
                password: "strongpassword",
            };

            // Act
            const response = await request(app)
                .post("/api/v1/auth/register")
                .send(userData);

            // Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            expect(users[0]).toHaveProperty("role");
            expect(users[0].role).toBe(Roles.CUSTOMER);
        });

        it("should store the hashed password in the database", async () => {
            // Arrange
            const userData = {
                firstName: "Mukul",
                lastName: "Padwal",
                age: 24,
                email: "mukulpadwal.me@gmail.com",
                password: "strongpassword",
            };

            // Act
            const response = await request(app)
                .post("/api/v1/auth/register")
                .send(userData);

            // Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            expect(users[0].password).not.toBe(userData.password);
            expect(users[0].password).toHaveLength(60);
            expect(users[0].password).toMatch(/^\$2b\$\d+\$/);
        });

        it("should return 400 status if email is already present", async () => {
            // Arrange
            const userData = {
                firstName: "Mukul",
                lastName: "Padwal",
                age: 24,
                email: "mukulpadwal.me@gmail.com",
                password: "strongpassword",
            };

            const userRepository = connection.getRepository(User);
            await userRepository.save({ ...userData, role: Roles.CUSTOMER });

            // Act
            const response = await request(app)
                .post("/api/v1/auth/register")
                .send(userData);

            const users = await userRepository.find();

            // Assert
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(1);
        });
    });

    // Sad path
    describe("Few required fields are missing", () => {
        it("should return 400 status code if email field is missing", async () => {
            const userData = {
                firstName: "Mukul",
                lastName: "Padwal",
                age: 24,
                password: "strongpassword",
            };

            // Act
            const response = await request(app)
                .post("/api/v1/auth/register")
                .send(userData);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            // Assert
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });
    });
});
