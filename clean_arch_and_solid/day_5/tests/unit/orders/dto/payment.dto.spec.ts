import { PaymentMethod, PaymentOrderStatus } from '@order-management/application/constants/payment.constant';
import { PaymentDetails, ProcessOrderRequest, ProcessOrderResponse } from '@order-management/application/dto/payment.dto';

describe('Payment DTOs', () => {
    it('debe crear un PaymentDetails válido', () => {
        const details: PaymentDetails = { method: PaymentMethod.CREDIT_CARD, cardNumber: '4111111111111111' };
        expect(details.method).toBe(PaymentMethod.CREDIT_CARD);
    });

    it('debe crear un ProcessOrderRequest válido', () => {
        const request: ProcessOrderRequest = {
            orderId: 'order_1',
            paymentDetails: { method: PaymentMethod.PAYPAL, paypalAccount: 'test@paypal.com' }
        };
        expect(request.paymentDetails.method).toBe(PaymentMethod.PAYPAL);
    });

    it('debe representar un ProcessOrderResponse', () => {
        const response: ProcessOrderResponse = {
            orderId: 'order_1',
            transactionId: 'tx123',
            status: PaymentOrderStatus.PROCESSED
        };
        expect(response.status).toBe(PaymentOrderStatus.PROCESSED);
    });
});
