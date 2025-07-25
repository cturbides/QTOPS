import { Product } from '@domain/entities/product.entity';

export interface ProductRepository {
    findAll(): Promise<Product[] | null[]>;
    findById(id: string): Promise<Product | null>;
    updateById(id: string, product: Partial<Product>): Promise<void>;
}
