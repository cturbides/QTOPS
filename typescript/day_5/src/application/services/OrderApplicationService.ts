import { Order } from '@domain/entities/Order';
import { eventBus } from '@shared/utils/EventBus';
import { OrderRepository } from '@domain/repositories/OrderRepository';
import { OrderPlacedEvent } from '@application/events/OrderPlacedEvent';
import { CreateOrderRequest } from '@application/dtos/CreateOrderRequest';

export class OrderApplicationService {
    constructor(private readonly orderRepository: OrderRepository) { }

    async placeOrder(request: CreateOrderRequest): Promise<Order> {
        const order = {
            id: request.id,
            status: 'pending',
            total: request.total,
            userId: request.userId,
            productIds: request.productIds,
        } as Order;

        await this.orderRepository.save(order);
        const event = new OrderPlacedEvent(order.id, order.userId);
        
        // added code
        await eventBus.emit('order.placed', event);

        return order;
    }
}
