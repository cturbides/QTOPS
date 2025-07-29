import { container } from '@main/container';
import { CONTAINER_TOKENS } from '@shared-kernel/constants/container.tokens';
import { MockProductCatalogService, MockInventoryService, MockNotificationService } from './mocks';
import { OrderCreatedEventHandler } from '@order-management/application/events/handlers/order-created.handler';
import { SimpleEventPublisher } from '@order-management/infrastructure/events/publisher/simple-event.publisher';
import { InMemoryShipmentRepository } from '@shipping/infrastructure/repositories/shipment.repository.in-memory';
import { InMemoryOrderRepository } from '@order-management/infrastructure/repositories/order.repository.in-memory';

beforeEach(async () => {
    // Re-bind repositorios InMemory para empezar "limpios"
    (await container.rebind(CONTAINER_TOKENS.OrderRepository)).to(InMemoryOrderRepository).inSingletonScope();
    (await container.rebind(CONTAINER_TOKENS.ShipmentRepository)).to(InMemoryShipmentRepository).inSingletonScope();

    // Reemplazar ProductCatalogService por mock
    (await container.rebind(CONTAINER_TOKENS.ProductCatalogService)).to(MockProductCatalogService).inSingletonScope();

    // Configurar event publisher con handlers mock
    const publisher = container.get<SimpleEventPublisher>(CONTAINER_TOKENS.SimpleEventPublisher);
    publisher.subscribe(new OrderCreatedEventHandler());
});

afterEach(() => {
    jest.clearAllMocks();
});
