import request from "supertest";
import app from "../../src/app";

// Used to group multiple test cases
describe("POST /auth/register", () => {
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

        it("Should return valid JSON response", async () => {
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
    });

    // Sad path
    describe("Few required fields are missing", () => {});
});
