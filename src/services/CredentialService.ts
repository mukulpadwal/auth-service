import bcrypt from "bcryptjs";

export default class CredentialService {
    constructor() {}

    async verifyPassword(password: string, passwordHash: string) {
        return await bcrypt.compare(password, passwordHash);
    }
}
