import { v4 as uuidv4 } from 'uuid';
import { Address } from '@shipping/domain/value-objects/address';
import { Shipment } from '@shipping/domain/entities/shipment.entity';
import { ShippingMethod } from '@shipping/domain/value-objects/shipping-method';
import { ShipmentRepository } from '@shipping/domain/repository/shipment.repository';
import { CreateShipmentInput } from '@shipping/application/dto/create-shipment.input';

export class CreateShipmentUseCase {
    constructor(private readonly shipmentRepo: ShipmentRepository) { }

    async execute(input: CreateShipmentInput): Promise<void> {
        const address = new Address(
            input.address.street,
            input.address.city,
            input.address.country,
            input.address.zipCode
        );

        const method = new ShippingMethod(
            input.shippingMethod.name,
            input.shippingMethod.estimatedDays
        );

        const shipment = new Shipment(uuidv4(), input.orderId, address, method);

        await this.shipmentRepo.save(shipment);
    }
}
