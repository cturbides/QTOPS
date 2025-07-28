import { User } from '@users/entities/user.entity';
import { OrderItem } from '@orders/entities/order-item.entity';
import { OrderStatus } from '@orders/constants/order-status.enum';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToMany(() => OrderItem, item => item.order, { cascade: true, eager: true })
    items: OrderItem[];

    @Column('decimal', { precision: 10, scale: 2 })
    totalPrice: number;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => User, user => user.orders)
    user: User;

    @Column({
        type: 'text',
        default: OrderStatus.PENDING
    })
    status: OrderStatus;
}
