import { Address } from '@shipping/domain/value-objects/address';
import { Shipment } from '@shipping/domain/entities/shipment.entity';
import { ShippingMethod } from '@shipping/domain/value-objects/shipping-method';

describe('Shipment Entity', () => {
    it('debe marcarse como enviado una vez', () => {
        const shipment = new Shipment(
            's1',
            'o1',
            new Address('Street', 'City', 'Country', '0001'),
            new ShippingMethod('Standard', 3)
        );

        expect(shipment.isShipped()).toBe(false);
        shipment.markAsShipped();
        expect(shipment.isShipped()).toBe(true);
        expect(() => shipment.markAsShipped()).toThrow(/ya fue marcado/);
    });
});
