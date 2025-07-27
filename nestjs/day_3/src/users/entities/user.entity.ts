import { IsEmail, IsString, MinLength } from "class-validator";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    @IsEmail()
    email: string;

    @Column()
    @IsString()
    @MinLength(2)
    name: string;

    @Column()
    @IsString()
    @MinLength(6)
    password: string;

    @CreateDateColumn()
    createdAt: Date;
}
