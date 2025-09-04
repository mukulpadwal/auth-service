import { type Repository } from "typeorm";
import { User } from "../entity/User";
import type { UserData } from "../types";
import createHttpError from "http-errors";
import { Roles } from "../constants";

// No framework related logic should be present here
export class UserService {
    constructor(private userRepository: Repository<User>) {}

    async create({ firstName, lastName, password, age, email }: UserData) {
        try {
            return await this.userRepository.save({
                firstName,
                lastName,
                password,
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
}
