import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { container } from '@main/container';
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { CONTAINER_TOKENS } from '@shared-kernel/constants/container.tokens';
import { OrderEntity } from '@order-management/infrastructure/repositories/typeorm/order.entity';
import { PostgresOrderRepository } from '@order-management/infrastructure/repositories/order.repository.postgres';

let pgContainer: StartedPostgreSqlContainer;
let dataSource: DataSource;

jest.setTimeout(60000);

beforeAll(async () => {
    // Levantar contenedor PostgreSQL
    pgContainer = await new PostgreSqlContainer('postgres:latest')
        .withDatabase('testdb')
        .withUsername('test')
        .withPassword('test')
        .start();

    // Crear conexión con DataSource
    dataSource = new DataSource({
        type: 'postgres',
        host: pgContainer.getHost(),
        port: pgContainer.getPort(),
        username: pgContainer.getUsername(),
        password: pgContainer.getPassword(),
        database: pgContainer.getDatabase(),
        entities: [OrderEntity],
        synchronize: true,
    });

    await dataSource.initialize();

    (await container.rebind(CONTAINER_TOKENS.OrderRepository))
        .toDynamicValue(() => new PostgresOrderRepository(dataSource))
        .inSingletonScope();
});

afterAll(async () => {
    if (dataSource?.isInitialized) {
        await dataSource.destroy();
    }

    if (pgContainer) {
        await pgContainer.stop();
    }
});
