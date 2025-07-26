import { Container } from 'inversify';
import { CONTAINER_TOKENS } from '@shared-kernel/constants/container.tokens';
import { OrderController } from '@order-management/infrastructure/controllers/order.controller';
import { ProductCatalogService } from '@order-management/domain/services/product-catalog.service';
import { CreateOrderUseCase } from '@order-management/application/use-cases/create-order.use-case';
import { InMemoryOrderRepository } from '@order-management/infrastructure/repositories/order.repository.in-memory';

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

export { container };
