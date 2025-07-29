import { PaymentStrategy } from '@order-management/domain/strategy/payment.strategy';
import { OrderRepository } from '@order-management/domain/repository/order.repository';
import { PaymentOrderStatus } from '@order-management/application/constants/payment.constant';
import { DomainEventPublisher } from '@shared-kernel/events/interfaces/domain-event.interface';
import { OrderProcessedEvent } from '@order-management/application/events/order-processed.event';
import { ProcessOrderRequest, ProcessOrderResponse } from '@order-management/application/dto/payment.dto';

export class ProcessOrderUseCase {
    constructor(
        private readonly orderRepository: OrderRepository,
        private readonly paymentStrategy: PaymentStrategy,
        private readonly eventPublisher: DomainEventPublisher
    ) { }

    async execute(request: ProcessOrderRequest): Promise<ProcessOrderResponse> {
        const order = await this.orderRepository.findById(request.orderId);

        if (!order) throw new Error('Orden no encontrada');


        const paymentResult = await this.paymentStrategy.processPayment(order.getTotal(), request.paymentDetails);

        order.confirm(paymentResult.transactionId);
        await this.orderRepository.save(order);

        await this.eventPublisher.publish(new OrderProcessedEvent(order.getId(), paymentResult.transactionId));

        return {
            orderId: order.getId(),
            status: PaymentOrderStatus.PROCESSED,
            transactionId: paymentResult.transactionId,
        };
    }
}
