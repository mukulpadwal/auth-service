import type { Repository } from "typeorm";
import { User } from "../entity/User";
import type { UserData } from "../types";

export class UserService {
    constructor(private userRepository: Repository<User>) {}

    async create({ firstName, lastName, password, age, email }: UserData) {
        await this.userRepository.save({
            firstName,
            lastName,
            password,
            age,
            email,
        });
    }
}
