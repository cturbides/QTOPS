import { injectable, inject } from "inversify";
import { ProductRepository } from "@domain/index";
import { CONTAINER_TOKENS } from "@infrastructure/index";
import { ProductRequest } from "@application/dto/product.request";

@injectable()
export class UpdateProductUseCase {
    constructor(
        @inject(CONTAINER_TOKENS.ProductRepository)
        private productRepository: ProductRepository
    ) { }

    async execute(productId: string, updateData: Partial<ProductRequest>): Promise<void> {
        const product = await this.productRepository.findById(productId);

        if (!product) {
            throw new Error('Producto no encontrado');
        }

        if (updateData.name) {
            product.setName(updateData.name);
        }

        if (updateData.price !== undefined) {
            product.updatePrice(updateData.price);
        }

        if (updateData.stock !== undefined) {
            product.reduceStock(product.getStock() - updateData.stock);
        }

        await this.productRepository.updateById(productId, product);
    }
}