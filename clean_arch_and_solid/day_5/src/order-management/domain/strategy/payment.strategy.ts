import { Money } from "@shared-kernel/value-objects/money";
import { PaymentDetails, PaymentResult } from "@order-management/application/dto/payment.dto";

export interface PaymentStrategy {
    processPayment(amount: Money, paymentDetails: PaymentDetails): Promise<PaymentResult>;
}