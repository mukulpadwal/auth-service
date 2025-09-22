import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import type { IUserData, IUserQueryParams } from "../types/index.js";
import { PrismaClient } from "../../generated/prisma/index.js";

// No framework related logic should be present here
export default class UserService {
    constructor(private user: PrismaClient["user"]) {}

    async create({
        firstName,
        lastName,
        password,
        age,
        email,
        role,
        tenantId,
    }: IUserData) {
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
                    role,
                    tenantId,
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
            include: {
                tenant: true,
            },
        });
    }

    async findById(id: number) {
        return await this.user.findFirst({
            where: { id },
            include: { tenant: true },
        });
    }

    async listAll(validatedQuery: IUserQueryParams) {
        const { q, currentPage, role, perPage } = validatedQuery;

        const whereClause = {
            AND: [
                q
                    ? {
                          OR: [
                              {
                                  firstName: {
                                      contains: q,
                                      mode: "insensitive" as const,
                                  },
                              },
                              {
                                  lastName: {
                                      contains: q,
                                      mode: "insensitive" as const,
                                  },
                              },
                              {
                                  email: {
                                      contains: q,
                                      mode: "insensitive" as const,
                                  },
                              },
                          ],
                      }
                    : {},
                role ? { role } : {},
            ],
        };

        const [users, count] = await Promise.all([
            this.user.findMany({
                where: whereClause,
                include: {
                    tenant: true,
                },
                skip: (currentPage - 1) * perPage,
                take: perPage,
                orderBy: { id: "desc" },
                omit: { password: true },
            }),
            this.user.count({ where: whereClause }),
        ]);

        return [users, count];
    }

    async update(
        userId: number,
        {
            firstName,
            lastName,
            age,
            email,
            role,
            tenantId,
        }: Omit<IUserData, "password">
    ) {
        return await this.user.update({
            where: { id: userId },
            data: {
                firstName,
                lastName,
                email,
                age,
                role,
                tenantId: tenantId ? Number(tenantId) : undefined,
            },
        });
    }

    async delete(userId: number) {
        await this.user.delete({
            where: { id: userId },
        });
    }
}
