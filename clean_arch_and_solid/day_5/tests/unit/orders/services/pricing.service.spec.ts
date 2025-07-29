import { Money } from '@shared-kernel/value-objects/money';
import { Order } from '@order-management/domain/entities/order.entity';
import { ProductId } from '@order-management/domain/value-objects/product-id';
import { Customer } from '@customer-management/domain/entities/customer.entity';
import { CustomerId } from '@order-management/domain/value-objects/customer-id';
import { PricingService } from '@order-management/domain/services/pricing.service';

describe('PricingService', () => {
    it('aplica 10% descuento a clientes premium con >5 items', () => {
        const pricing = new PricingService();
        const cust = new Customer('c1', 'Premium', true);
        const order = new Order('o1', new CustomerId('c1'));

        for (let i = 0; i < 6; i++) {
            order.addItem(new ProductId(`p${i}`), 1, new Money(100, 'USD'));
        }

        const discount = pricing.calculateDiscount(cust, order);
        expect(discount.getValue()).toBe(60);
    });

    it('retorna 0 para clientes no premium', () => {
        const pricing = new PricingService();
        const cust = new Customer('c2', 'Normal', false);
        const order = new Order('o2', new CustomerId('c2'));
        order.addItem(new ProductId('p1'), 1, new Money(100, 'USD'));

        const discount = pricing.calculateDiscount(cust, order);
        expect(discount.getValue()).toBe(0);
    });
});
