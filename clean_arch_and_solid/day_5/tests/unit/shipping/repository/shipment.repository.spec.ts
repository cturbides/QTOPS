import { DummyShipmentRepo } from '../../mocks';
import { Address } from '@shipping/domain/value-objects/address';
import { Shipment } from '@shipping/domain/entities/shipment.entity';
import { ShippingMethod } from '@shipping/domain/value-objects/shipping-method';

describe('ShipmentRepository', () => {
    it('debe guardar y recuperar Shipments', async () => {
        const repo = new DummyShipmentRepo();
        const shipment = new Shipment(
            's1',
            'o1',
            new Address('Street', 'City', 'Country', '0001'),
            new ShippingMethod('Standard', 3)
        );
        await repo.save(shipment);

        expect(await repo.findById('s1')).toBe(shipment);
        expect(await repo.findByOrderId('o1')).toBe(shipment);
        expect((await repo.findAll()).length).toBe(1);
    });

    it('debe retornar null si orderId no existe', async () => {
        const repo = new DummyShipmentRepo();
        const result = await repo.findByOrderId('o999');

        expect(result).toBeNull();
    });


});
