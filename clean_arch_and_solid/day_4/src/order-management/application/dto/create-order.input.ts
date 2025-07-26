export interface CreateOrderInput {
    orderId: string;
    customerId: string;
    items: Array<{
        quantity: number;
        productId: string;
    }>;
}
