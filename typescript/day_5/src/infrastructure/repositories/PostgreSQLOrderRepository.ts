import { Config } from '@infrastructure/config';
import { OrderRepository, Order } from '@domain/index';

export class PostgreSQLOrderRepository implements OrderRepository {
    constructor(private dbConfig: Config.DatabaseConfig) { }

    async findById(id: string): Promise<Order & { createdAt: Date, updatedAt: Date } | null> {
        console.log(`Fetching order ${id} from DB at ${this.dbConfig.url}`);

        return {
            id,
            userId: 'user123',
            productIds: ['product1', 'product2'],
            total: 199.98,
            status: 'completed',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }

    async save(order: Order): Promise<void> {
        console.log(`Saving order ${order.id} to DB`);
    }
}
