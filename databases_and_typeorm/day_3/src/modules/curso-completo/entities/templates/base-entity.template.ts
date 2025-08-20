import { IsOptional } from 'class-validator';
import { CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Column } from 'typeorm';

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

    @Column({ name: 'created_at' })
    fechaCreacion: Date;

    @Column({ name: 'updated_at' })
    fechaActualizacion: Date;
}