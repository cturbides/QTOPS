import { OrderFactory } from '@order-management/domain/factories/oder.factory';

describe('OrderFactory', () => {
    it('debe crear un Order válido', () => {
        const order = OrderFactory.create('o1', 'c1');
        expect(order.getId()).toBe('o1');
        expect(order.getCustomerId().getValue()).toBe('c1');
    });
});
