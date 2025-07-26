import { Order } from '@order-management/domain/entities/order.entity';
import { CustomerId } from '@order-management/domain/value-objects/customer-id';

export interface OrderRepository {
    save(order: Order): Promise<void>;
    findByCustomer(customerId: CustomerId): Promise<Order[]>;
}
