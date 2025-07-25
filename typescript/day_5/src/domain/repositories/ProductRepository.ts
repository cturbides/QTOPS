import { Product } from '@domain/entities/Product';

export interface ProductRepository {
    findById(id: string): Promise<Product | null>;
    save(product: Product): Promise<void>;
}
