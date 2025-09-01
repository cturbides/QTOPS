export const TypeOrmConfig = {
    type: 'postgres' as const,
    host: process.env.DB_HOST || 'localhost',
    port: +(process.env.DB_PORT || 5432),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'password',
    database: process.env.DB_NAME || 'elearning_dev',
    synchronize: false,
    logging: 'error' as any,
    autoLoadEntities: true
};