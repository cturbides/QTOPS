import { Customer } from '@customer-management/domain/entities/customer.entity';

describe('Customer Entity', () => {
    it('debe exponer getters y premium flag', () => {
        const cust = new Customer('c1', 'John Doe', true);
        expect(cust.getId()).toBe('c1');
        expect(cust.getName()).toBe('John Doe');
        expect(cust.isPremium()).toBe(true);
    });
});
