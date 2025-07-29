export interface DomainEvent {
    occurredOn: Date;
}

export interface DomainEventHandler<T extends DomainEvent> {
    handle(event: T): Promise<void>;
}

export interface DomainEventPublisher {
    publish<T extends DomainEvent>(event: T): Promise<void>;
}
