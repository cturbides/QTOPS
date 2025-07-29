import { Address } from '@shipping/domain/value-objects/address';
import { ShippingMethod } from '@shipping/domain/value-objects/shipping-method';

export class Shipment {
    private shipped: boolean = false;
    private shippedAt?: Date;

    constructor(
        private readonly id: string,
        private readonly orderId: string,
        private readonly address: Address,
        private readonly shippingMethod: ShippingMethod
    ) {
        if (!id || !orderId || !address || !shippingMethod) {
            throw new Error('Todos los campos del envío son obligatorios');
        }
    }

    markAsShipped(): void {
        if (this.shipped) throw new Error('El envío ya fue marcado como enviado');
        this.shipped = true;
        this.shippedAt = new Date();
    }

    isShipped(): boolean {
        return this.shipped;
    }

    getShippingInfo(): string {
        return `${this.shippingMethod.getName()} a ${this.address.toString()}`;
    }

    getId(): string {
        return this.id;
    }
}
