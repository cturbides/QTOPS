import { Money } from '@shared-kernel/value-objects/money';
import { ProductCatalogService } from '@order-management/domain/services/product-catalog.service';

export class MockProductCatalogService extends ProductCatalogService {
    async getProductInfo(productId: string) {
        return {
            productId,
            name: `Producto-${productId}`,
            unitPrice: new Money(50, 'USD')
        };
    }
}

export class MockNotificationService {
    async notifyOrderCreated(orderId: string) {
        console.log(`Notificación simulada para la orden ${orderId}`);
    }
}

export class MockInventoryService {
    async reserveItems(items: any[]) {
        console.log(`Reservando inventario simulado:`, items);
    }
}
