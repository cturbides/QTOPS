import 'dotenv/config';
import { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';

const options: DataSourceOptions = {
    type: process.env.DB_TYPE as any || 'sqlite',
    database: process.env.DB_DATABASE || 'database.sqlite',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    migrations: [join(__dirname, '..', 'migrations', '*.{ts,js}')],
    entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
    synchronize: false,
};

export const AppDataSource = new DataSource(options);
