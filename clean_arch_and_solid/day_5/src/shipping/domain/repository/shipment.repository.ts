import { Shipment } from '@shipping/domain/entities/shipment.entity';

export interface ShipmentRepository {
    save(shipment: Shipment): Promise<void>;
    findAll(): Promise<Shipment[] | null[]>;
    findById(id: string): Promise<Shipment | null>;
    findByOrderId(orderId: string): Promise<Shipment | null>;
}
