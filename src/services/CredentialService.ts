import bcrypt from "bcrypt";

export class CredentialService {
    constructor() {}

    async verifyPassword(password: string, passwordHash: string) {
        return await bcrypt.compare(password, passwordHash);
    }
}
