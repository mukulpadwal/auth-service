import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import type { IUserData } from "../types/index.js";
import { Roles } from "../constants/index.js";
import { PrismaClient } from "../../generated/prisma/index.js";

// No framework related logic should be present here
export default class UserService {
    constructor(private user: PrismaClient["user"]) {}

    async create({ firstName, lastName, password, age, email }: IUserData) {
        const user = await this.user.findFirst({
            where: { email },
        });

        if (user) {
            const err = createHttpError(
                400,
                "User with email is already present in the DB."
            );
            throw err;
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        try {
            return await this.user.create({
                data: {
                    firstName,
                    lastName,
                    password: hashedPassword,
                    age,
                    email,
                    role: Roles.CUSTOMER,
                },
            });
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            const customError = createHttpError(
                500,
                `Failed to store the data in th DB`
            );
            throw customError;
        }
    }

    async findByEmail(email: string) {
        return await this.user.findFirst({
            where: { email },
        });
    }

    async findById(id: number) {
        return await this.user.findFirst({
            where: { id },
        });
    }
}
