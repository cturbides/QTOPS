import { Repository, DataSource } from 'typeorm';
import { OrderEntity } from './typeorm/order.entity';
import { Order } from '@order-management/domain/entities/order.entity';
import { CustomerId } from '@order-management/domain/value-objects/customer-id';
import { OrderRepository } from '@order-management/domain/repository/order.repository';

export class PostgresOrderRepository implements OrderRepository {
    private repo: Repository<OrderEntity>;

    constructor(dataSource: DataSource) {
        this.repo = dataSource.getRepository(OrderEntity);
    }

    async save(order: Order): Promise<void> {
        const entity = this.repo.create({
            id: order.getId(),
            confirmed: order.isConfirmed(),
            transactionId: order.getTransactionId(),
            customerId: order.getCustomerId().getValue(),
        });

        await this.repo.save(entity);
    }

    async findById(orderId: string): Promise<Order | null> {
        const entity = await this.repo.findOneBy({ id: orderId });
        if (!entity) return null;
        return new Order(entity.id, new CustomerId(entity.customerId));
    }

    async findByCustomer(customerId: CustomerId): Promise<Order[]> {
        const entities = await this.repo.findBy({ customerId: customerId.getValue() });
        return entities.map((e) => new Order(e.id, new CustomerId(e.customerId)));
    }
}
