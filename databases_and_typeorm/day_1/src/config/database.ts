import { join } from 'path';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'password',
  database: 'elearning_dev',
  migrations: [join(__dirname, '..', 'migrations', '*.{ts,js}')],
  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
  synchronize: false, // Solo en desarrollo
  logging: true
});
