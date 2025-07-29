import { Shipment } from '@shipping/domain/entities/shipment.entity';
import { ShipmentRepository } from '@shipping/domain/repository/shipment.repository';

export class InMemoryShipmentRepository implements ShipmentRepository {
    private readonly shipments: Map<string, Shipment> = new Map();

    async save(shipment: Shipment): Promise<void> {
        this.shipments.set(shipment.getId(), shipment);
    }

    async findById(id: string): Promise<Shipment | null> {
        return this.shipments.get(id) ?? null;
    }

    async findByOrderId(orderId: string): Promise<Shipment | null> {
        for (const shipment of this.shipments.values()) {
            if (shipment.getId() === orderId) {
                return shipment;
            }
        }

        return null;
    }

    async findAll(): Promise<Shipment[]> {
        return Array.from(this.shipments.values());
    }
}
