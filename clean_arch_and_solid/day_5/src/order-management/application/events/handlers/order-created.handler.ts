import { DomainEventHandler } from '@shared-kernel/events/interfaces/domain-event.interface';
import { OrderProcessedEvent } from '@order-management/application/events/order-processed.event';

export class OrderCreatedEventHandler implements DomainEventHandler<OrderProcessedEvent> {
    async handle(event: OrderProcessedEvent): Promise<void> {
        console.log(`Inventario reservado para la orden ${event.orderId}`);
        console.log(`Notificación enviada para la orden ${event.orderId}`);
    }
}
