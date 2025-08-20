import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

export class BaseEntity {
    @CreateDateColumn()
    fechaCreacion: Date;

    @UpdateDateColumn()
    fechaActualizacion: Date;
}