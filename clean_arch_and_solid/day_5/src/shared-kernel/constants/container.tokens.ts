import { SimpleEventPublisher } from "@order-management/infrastructure/events/publisher/simple-event.publisher";

export const CONTAINER_TOKENS = {
    OrderController: Symbol.for('OrderController'),
    OrderRepository: Symbol.for('OrderRepository'),
    ProcessOrderUseCase: Symbol.for('ProcessOrderUseCase'),
    CreateOrderUseCase: Symbol.for('CreateOrderUseCase'),
    ProductCatalogService: Symbol.for('ProductCatalogService'),
    ShipmentRepository: Symbol.for('ShipmentRepository'),
    ShipmentController: Symbol.for('ShipmentController'),
    CreateShipmentUseCase: Symbol.for('CreateShipmentUseCase'),
    PaymentStrategy: Symbol.for('PaymentStrategy'),
    SimpleEventPublisher: Symbol.for('SimpleEventPublisher'),
};
