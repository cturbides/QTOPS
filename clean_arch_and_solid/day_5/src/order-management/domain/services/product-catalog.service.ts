import { Money } from '@shared-kernel/value-objects/money';
import { ProductInfo } from '@order-management/application/dto/product-info.dto';

// Dummy lookup service for product information
export class ProductCatalogService {
  async getProductInfo(productId: string): Promise<ProductInfo> {
    return {
      productId,
      name: 'Producto genérico',
      unitPrice: new Money(100, 'USD')
    };
  }
}
