import { DomainEvent, DomainEventPublisher, DomainEventHandler } from '@shared-kernel/events/interfaces/domain-event.interface';

export class SimpleEventPublisher implements DomainEventPublisher {
    private handlers: DomainEventHandler<DomainEvent>[] = [];

    subscribe(handler: DomainEventHandler<DomainEvent>) {
        this.handlers.push(handler);
    }

    async publish<T extends DomainEvent>(event: T): Promise<void> {
        for (const handler of this.handlers) {
            await handler.handle(event);
        }
    }
}
