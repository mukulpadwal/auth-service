import { DataSource } from "typeorm";

export const truncateTables = async (connection: DataSource) => {
    // List of all the entities
    const entities = connection.entityMetadatas;

    for (const entity of entities) {
        const repository = connection.getRepository(entity.name);
        await repository.clear();
    }
};

export const isJwt = (token: string | null): boolean => {
    const parts = token?.split(".");

    if (parts?.length !== 3) {
        return false;
    }

    try {
        parts.forEach((part) => {
            Buffer.from(part, "base64").toString("utf-8");
        });
    } catch (error) {
        return false;
    }

    return true;
};
