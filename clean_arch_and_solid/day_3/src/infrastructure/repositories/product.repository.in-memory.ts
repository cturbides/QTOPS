import { injectable } from 'inversify';
import * as crypto from 'crypto';
import { ProductRepository, Product } from '@domain/index';

@injectable()
export class InMemoryProductRepository implements ProductRepository {
    private products = new Map<string, Product>();

    constructor() {
        this.initializeProducts();
    }

    private initializeProducts(): void {
        const product = new Product(
            crypto.randomUUID(),
            'Producto de prueba',
            100,
            50
        );

        this.products.set(product.getId(), product);
    }

    async findById(id: string): Promise<Product | null> {
        return this.products.get(id) || null;
    }

    async findAll(): Promise<Product[] | null[]> {
        return Array.from(this.products.values());
    }

    async updateById(id: string, product: Partial<Product>): Promise<void> {
        const existingProduct = await this.findById(id);

        if (!existingProduct) {
            throw new Error('Producto no encontrado');
        }

        Object.assign(existingProduct, product);

        this.products.set(existingProduct.getId(), existingProduct);
    }
}
