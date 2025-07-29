import { Money } from '@shared-kernel/value-objects/money';
import { PaymentMethod, PaymentOrderStatus, PaymentResultStatus } from '@order-management/application/constants/payment.constant';

export interface PaymentDetails {
    cardNumber?: string;
    method: PaymentMethod;
    paypalAccount?: string;
}

export interface PaymentResult {
    amount: Money;
    transactionId: string;
    status: PaymentResultStatus;
}

export interface ProcessOrderRequest {
    orderId: string;
    paymentDetails: PaymentDetails;
}

export interface ProcessOrderResponse {
    orderId: string;
    transactionId: string;
    status: PaymentOrderStatus;
}
