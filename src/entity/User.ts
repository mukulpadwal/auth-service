import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar" })
    firstName: string;

    @Column({ type: "varchar" })
    lastName: string;

    @Column({ type: "varchar", unique: true })
    email: string;

    @Column({ type: "integer" })
    age: number;

    @Column({ type: "varchar" })
    password: string;
}
