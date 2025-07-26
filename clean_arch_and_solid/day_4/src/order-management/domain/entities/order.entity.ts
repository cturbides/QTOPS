import { OrderItem } from './order-item.entity';
import { Money } from '@shared-kernel/value-objects/money';
import { ProductId } from '@order-management/domain/value-objects/product-id';
import { CustomerId } from '@order-management/domain/value-objects/customer-id';

export class Order {
    private readonly items: OrderItem[] = [];

    constructor(
        private readonly id: string,
        private readonly customerId: CustomerId
    ) {
        if (!id) throw new Error('El ID del pedido es obligatorio');
        if (!customerId) throw new Error('El ID del cliente es obligatorio');
    }

    addItem(productId: ProductId, quantity: number, unitPrice: Money): void {
        const existing = this.items.find(item => item['productId'].getValue() === productId.getValue());
        if (existing) {
            existing.increaseQuantity(quantity);
        } else {
            this.items.push(new OrderItem(productId, quantity, unitPrice));
        }
    }

    getTotal(): Money {
        return this.items.reduce((total, item) => {
            return total.add(item.getSubtotal());
        }, Money.zero());
    }

    getItemCount(): number {
        return this.items.reduce((sum, item) => sum + 1, 0);
    }

    getId(): string {
        return this.id;
    }

    getCustomerId(): CustomerId {
        return this.customerId;
    }

    getItems(): OrderItem[] {
        return [...this.items];
    }
}
