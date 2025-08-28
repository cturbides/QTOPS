import { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import { TypeOrmQueryLogger } from '../modules/performance/loggers/typeorm-query.logger';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: +(process.env.DB_PORT || 5432),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'password',
  database: process.env.DB_NAME || 'elearning_dev',
  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
  migrations: [join(__dirname, '..', '**', '*.migration.{ts,js}')],
  synchronize: false,
  logging: (process.env.TYPEORM_LOGGING?.split(',') as any) || ['error'],
  logger: new TypeOrmQueryLogger(),
  migrationsTransactionMode: 'each',
  cache: { duration: 3000 }
};

export const AppDataSource = new DataSource(dataSourceOptions);

export const NestTypeOrmConfig: Record<string, unknown> = {
  ...dataSourceOptions,
  autoLoadEntities: true
};
