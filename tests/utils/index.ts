import { DataSource } from "typeorm";

export const truncateTables = async (connection: DataSource) => {
    // List of all the entities
    const entities = connection.entityMetadatas;

    for (const entity of entities) {
        const repository = connection.getRepository(entity.name);
        await repository.clear();
    }
};
