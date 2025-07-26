import { Order } from '@order-management/domain/entities/order.entity';
import { ProductId } from '@order-management/domain/value-objects/product-id';
import { CustomerId } from '@order-management/domain/value-objects/customer-id';
import { OrderRepository } from '@order-management/domain/repository/order.repository';
import { ProductCatalogService } from '@order-management/domain/services/product-catalog.service'
import { CreateOrderInput } from '../dto/create-order.input';

export class CreateOrderUseCase {
    constructor(
        private readonly orderRepo: OrderRepository,
        private readonly productCatalog: ProductCatalogService
    ) { }

    async execute(input: CreateOrderInput): Promise<Order> {
        const customerId = new CustomerId(input.customerId);
        const order = new Order(input.orderId, customerId);

        for (const item of input.items) {
            const productInfo = await this.productCatalog.getProductInfo(item.productId);
            order.addItem(
                new ProductId(item.productId),
                item.quantity,
                productInfo.unitPrice
            );
        }

        await this.orderRepo.save(order);
        return order;
    }
}
