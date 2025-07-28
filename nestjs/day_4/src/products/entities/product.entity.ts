import { Expose } from 'class-transformer';
import { OrderItem } from '@orders/entities/order-item.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity()
export class Product {
    @Expose()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Expose()
    @Column()
    name: string;

    @Expose()
    @Column('decimal', { precision: 10, scale: 2 })
    price: number;

    @Expose()
    @Column('int')
    stock: number;

    @OneToMany(() => OrderItem, item => item.product)
    orders: OrderItem[];
}
