import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'orders' })
export class OrderEntity {
    @PrimaryColumn('uuid')
    id!: string;

    @Column('varchar')
    customerId!: string;

    @Column({ default: false, type: 'boolean' })
    confirmed!: boolean;

    @Column({ nullable: true, type: 'varchar' })
    transactionId!: string | undefined;
}
