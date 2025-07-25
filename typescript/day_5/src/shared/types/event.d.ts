import { UserCreatedEvent } from '@application/events/UserCreatedEvent';
import { OrderPlacedEvent } from '@application/events/OrderPlacedEvent';

declare module '@shared/utils/EventBus' {
    interface EventPayloads {
        'user.created': UserCreatedEvent;
        'order.placed': OrderPlacedEvent;
    }
}
