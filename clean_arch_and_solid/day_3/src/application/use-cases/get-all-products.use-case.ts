import { injectable, inject } from "inversify";
import { Product, ProductRepository } from "@domain/index";
import { ProductResponse } from "@application/dto/product.response";
import { CONTAINER_TOKENS } from "@infrastructure/types/container.tokens";

@injectable()
export class GetAllProductsUseCase {
    constructor(
        @inject(CONTAINER_TOKENS.ProductRepository)
        private productRepository: ProductRepository
    ) { }

    async execute(): Promise<ProductResponse[]> {
        const products = await this.productRepository.findAll();

        if (!products || products.length === 0) {
            throw new Error('No se encontraron productos');
        }

        return products.map(product => ({
            id: (product as Product).getId(),
            name: (product as Product).getName(),
            price: (product as Product).getPrice(),
            stock: (product as Product).getStock()
        }));
    }
}