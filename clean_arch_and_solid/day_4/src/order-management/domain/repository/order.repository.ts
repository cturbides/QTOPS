import { Order } from '../entities/order.entity';
import { CustomerId } from '../value-objects/customer-id';

export interface OrderRepository {
    save(order: Order): Promise<void>;
    findByCustomer(customerId: CustomerId): Promise<Order[]>;
}
