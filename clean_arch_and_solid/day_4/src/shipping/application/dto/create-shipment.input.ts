export interface CreateShipmentInput {
    orderId: string;
    address: {
        street: string;
        city: string;
        country: string;
        zipCode: string;
    };
    shippingMethod: {
        name: string;
        estimatedDays: number;
    };
}