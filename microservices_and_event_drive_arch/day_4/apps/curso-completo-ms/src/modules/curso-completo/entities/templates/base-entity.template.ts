import { IsOptional } from 'class-validator';
import { CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

export class BaseEntity {
    @IsOptional()
    @CreateDateColumn({ name: 'created_at' })
    createdAt?: Date;

    @IsOptional()
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt?: Date;

    @IsOptional()
    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt?: Date;
}