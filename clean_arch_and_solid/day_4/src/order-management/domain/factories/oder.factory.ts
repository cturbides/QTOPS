import { Order } from '@order-management/domain/entities/order.entity';
import { CustomerId } from '@order-management/domain/value-objects/customer-id';

export class OrderFactory {
    static create(orderId: string, customerId: string): Order {
        return new Order(orderId, new CustomerId(customerId));
    }
}
