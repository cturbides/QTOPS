import { Config } from '@infrastructure/config';
import { ProductRepository, Product } from '@domain/index';

export class PostgreSQLProductRepository implements ProductRepository {
    constructor(private dbConfig: Config.DatabaseConfig) { }

    async findById(id: string): Promise<Product & { createdAt: Date, updatedAt: Date } | null> {
        console.log(`Fetching product ${id} from DB at ${this.dbConfig.url}`);

        return {
            id,
            name: 'Dummy Product',
            price: 99.99,
            category: 'Electronics',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }

    async save(product: Product): Promise<void> {
        console.log(`Saving product ${product.name} to DB`);
    }
}