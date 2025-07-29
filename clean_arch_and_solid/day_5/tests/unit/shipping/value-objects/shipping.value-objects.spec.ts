import { Address } from '@shipping/domain/value-objects/address';
import { ShippingMethod } from '@shipping/domain/value-objects/shipping-method';

describe('Shipping Value Objects', () => {
    it('Address requiere todos los campos', () => {
        expect(() => new Address('', 'C', 'CO', '0001')).toThrow(/obligatorios/);
    });

    it('ShippingMethod requiere nombre válido y días positivos', () => {
        expect(() => new ShippingMethod('', 3)).toThrow(/no puede estar vacío/);
        expect(() => new ShippingMethod('Express', 0)).toThrow(/positivo/);
    });

    it('Address debe lanzar error si falta ciudad', () => {
        expect(() => new Address('Street', '', 'Country', '12345'))
            .toThrow(/obligatorios/);
    });

    it('ShippingMethod debe lanzar error si días <= 0', () => {
        expect(() => new ShippingMethod('Express', 0)).toThrow(/positivo/);
    });

    it('ShippingMethod debe retornar nombre y días', () => {
        const method = new ShippingMethod('Standard', 5);
        expect(method.getName()).toBe('Standard');
        expect(method.getEstimatedDays()).toBe(5);
    });
});
