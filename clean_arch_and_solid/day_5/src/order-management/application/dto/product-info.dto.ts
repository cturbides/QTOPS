import { Money } from '@shared-kernel/value-objects/money';

export interface ProductInfo {
    name: string;
    unitPrice: Money;
    productId: string;
}
