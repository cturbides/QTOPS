import { Order } from '@order-management/domain/entities/order.entity';
import { CustomerId } from '@order-management/domain/value-objects/customer-id';
import { OrderRepository } from '@order-management/domain/repository/order.repository';

export class InMemoryOrderRepository implements OrderRepository {
    private readonly orders: Order[] = [];

    async save(order: Order): Promise<void> {
        this.orders.push(order);
    }

    async findByCustomer(customerId: CustomerId): Promise<Order[]> {
        return this.orders.filter(order =>
            order.getCustomerId().getValue() === customerId.getValue()
        );
    }
}
