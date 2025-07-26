import { Container } from 'inversify';
import { CONTAINER_TOKENS } from '@shared-kernel/constants/container.tokens';
import { OrderController } from '@order-management/infrastructure/controllers/order.controller';
import { ProductCatalogService } from '@order-management/domain/services/product-catalog.service';
import { CreateOrderUseCase } from '@order-management/application/use-cases/create-order.use-case';
import { InMemoryOrderRepository } from '@order-management/infrastructure/repositories/order.repository.in-memory';

import { ShipmentController } from '@shipping/infrastructure/controllers/shipment.controller';
import { CreateShipmentUseCase } from '@shipping/application/use-cases/create-shipment.use-case';
import { InMemoryShipmentRepository } from '@shipping/infrastructure/repositories/shipment.repository.in-memory';

const container = new Container();

container.bind(CONTAINER_TOKENS.OrderRepository).to(InMemoryOrderRepository).inSingletonScope();
container.bind(CONTAINER_TOKENS.ProductCatalogService).to(ProductCatalogService).inSingletonScope();
container.bind(CONTAINER_TOKENS.CreateOrderUseCase).toDynamicValue(() => {
    return new CreateOrderUseCase(
        container.get(CONTAINER_TOKENS.OrderRepository),
        container.get(CONTAINER_TOKENS.ProductCatalogService)
    );
}).inSingletonScope();

container.bind(CONTAINER_TOKENS.OrderController).toDynamicValue(() => {
    return new OrderController(
        container.get(CONTAINER_TOKENS.CreateOrderUseCase)
    );
}).inSingletonScope();


// Shipping module bindings
container.bind(CONTAINER_TOKENS.ShipmentRepository).to(InMemoryShipmentRepository).inSingletonScope();

container.bind(CONTAINER_TOKENS.CreateShipmentUseCase).toDynamicValue(() =>
    new CreateShipmentUseCase(container.get(CONTAINER_TOKENS.ShipmentRepository))
);

container.bind(CONTAINER_TOKENS.ShipmentController).toDynamicValue(() =>
    new ShipmentController(
        container.get(CONTAINER_TOKENS.CreateShipmentUseCase),
        container.get(CONTAINER_TOKENS.ShipmentRepository)
    )
);


export { container };
