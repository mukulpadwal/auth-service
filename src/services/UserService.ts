import createHttpError from "http-errors";
import { type Repository } from "typeorm";
import bcrypt from "bcrypt";
import { User } from "../entity/User";
import type { UserData } from "../types";
import { Roles } from "../constants";

// No framework related logic should be present here
export class UserService {
    constructor(private userRepository: Repository<User>) {}

    async create({ firstName, lastName, password, age, email }: UserData) {
        const user = await this.userRepository.findOne({
            where: { email: email },
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
            return await this.userRepository.save({
                firstName,
                lastName,
                password: hashedPassword,
                age,
                email,
                role: Roles.CUSTOMER,
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

    async getUserByEmail(email: string) {
        return await this.userRepository.findOne({
            where: { email: email },
        });
    }
}
