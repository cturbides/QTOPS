import { Shipment } from '@shipping/domain/entities/shipment.entity';
import { ShipmentRepository } from '@shipping/domain/repository/shipment.repository';
import { DomainEvent, DomainEventHandler, DomainEventPublisher } from '@shared-kernel/events/interfaces/domain-event.interface';

export class DummyEvent implements DomainEvent { occurredOn = new Date(); }

export class DummyHandler implements DomainEventHandler<DummyEvent> {
    called = false;
    async handle() { this.called = true; }
}

export class DummyPublisher implements DomainEventPublisher {
    handlers: any[] = [];
    subscribe(h: any) { this.handlers.push(h); }
    async publish(e: any) { for (const h of this.handlers) await h.handle(e); }
}


export class DummyShipmentRepo implements ShipmentRepository {
    private store: Map<string, Shipment> = new Map();
    async save(s: Shipment) { this.store.set(s.getId(), s); }
    async findAll() { return Array.from(this.store.values()); }
    async findById(id: string) { return this.store.get(id) ?? null; }
    async findByOrderId(orderId: string) {
        return Array.from(this.store.values()).find((s: any) => s.orderId === orderId) ?? null;
    }
}
