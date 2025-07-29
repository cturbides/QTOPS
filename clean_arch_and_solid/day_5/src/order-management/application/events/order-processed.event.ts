import { DomainEvent } from '@shared-kernel/events/interfaces/domain-event.interface';

export class OrderProcessedEvent implements DomainEvent {
    occurredOn: Date = new Date();
    public static readonly EVENT_NAME = 'order.processed';

    constructor(
        public readonly orderId: string,
        public readonly transactionId: string
    ) {
        console.log(`Evento ${OrderProcessedEvent.EVENT_NAME} creado para la orden ${orderId}`);
    }
}
