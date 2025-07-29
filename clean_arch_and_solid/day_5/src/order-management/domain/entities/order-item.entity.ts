import { Money } from '@shared-kernel/value-objects/money';
import { ProductId } from '@order-management/domain/value-objects/product-id';

export class OrderItem {
    constructor(
        private readonly productId: ProductId,
        private quantity: number,
        private readonly unitPrice: Money
    ) {
        if (!productId) throw new Error('El ID del producto es obligatorio');
        if (!quantity || quantity <= 0) throw new Error('La cantidad debe ser mayor a cero');
        if (!unitPrice || unitPrice.getValue() === 0) throw new Error('El precio unitario debe ser mayor a cero');
    }

    getSubtotal(): Money {
        return this.unitPrice.multiply(this.quantity);
    }

    increaseQuantity(amount: number): void {
        this.quantity += amount;
    }
}
