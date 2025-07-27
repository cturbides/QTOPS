import { Role } from "@common/constants/roles.enum";
import { Order } from "@orders/entities/order.entity";
import { IsArray, IsEmail, IsEnum, IsString, MinLength } from "class-validator";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";

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

    @Column({ default: true })
    isActive: boolean;

    @Column('simple-array')
    @IsArray()
    @IsEnum(Role, { each: true })
    roles: Role[];

    @OneToMany(() => Order, order => order.user)
    orders: Order[];
}
