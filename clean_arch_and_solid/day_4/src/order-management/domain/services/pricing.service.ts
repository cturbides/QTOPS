import { Money } from '@shared-kernel/value-objects/money';
import { Order } from '@order-management/domain/entities/order.entity';
import { Customer } from '@customer-management/domain/entities/customer.entity';

export class PricingService {
    calculateDiscount(customer: Customer, order: Order): Money {
        if (customer.isPremium() && order.getItemCount() > 5) {
            return order.getTotal().multiply(0.1); // 10% descuento
        }
        return Money.zero();
    }
}
