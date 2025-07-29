import { Money } from '@shared-kernel/value-objects/money';
import { PaymentStrategy } from '@order-management/domain/strategy/payment.strategy';
import { PaymentDetails, PaymentResult } from '@order-management/application/dto/payment.dto';
import { PaymentResultStatus } from '@order-management/application/constants/payment.constant';

export class CreditCardPaymentService implements PaymentStrategy {
    async processPayment(amount: Money, details: PaymentDetails): Promise<PaymentResult> {
        if (amount.getValue() > 10000) {
            throw new Error('Monto excede límite de tarjeta');
        }

        return {
            amount: amount,
            transactionId: `cc_${Date.now()}`,
            status: PaymentResultStatus.APPROVED,
        };
    }
}

export class PayPalPaymentService implements PaymentStrategy {
    async processPayment(amount: Money, details: PaymentDetails): Promise<PaymentResult> {
        return {
            amount: amount,
            transactionId: `pp_${Date.now()}`,
            status: PaymentResultStatus.APPROVED,
        };
    }
}
