import { injectable, inject } from "inversify";
import { ProductRepository } from "@domain/index";
import { CONTAINER_TOKENS } from "@infrastructure/index";
import { ProductResponse } from "@application/dto/product.response";

@injectable()
export class GetProductUseCase {
    constructor(
        @inject(CONTAINER_TOKENS.ProductRepository)
        private productRepository: ProductRepository
    ) { }

    async execute(productId: string): Promise<ProductResponse> {
        const product = await this.productRepository.findById(productId);

        if (!product) {
            throw new Error('Producto no encontrado');
        }

        return {
            id: product.getId(),
            name: product.getName(),
            price: product.getPrice(),
            stock: product.getStock()
        };
    }
}