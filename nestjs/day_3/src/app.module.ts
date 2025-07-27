import { join } from 'path';
import { Module } from '@nestjs/common';
import { DataSourceOptions } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '@users/users.module';
import { OrdersModule } from '@orders/orders.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService): DataSourceOptions => {
                const dbType = config.get<'mysql' | 'postgres' | 'sqlite'>('DB_TYPE') || 'sqlite';

                const commonOptions: Partial<DataSourceOptions> = {
                    type: dbType,
                    synchronize: true,
                    database: config.get<string>('DB_DATABASE', 'database.sqlite'),
                    entities: [join(__dirname, '**', '*.entity.{ts,js}')],
                };

                if (dbType === 'sqlite') {
                    return commonOptions as DataSourceOptions;
                }

                const extendedOptions: DataSourceOptions = {
                    ...commonOptions,
                    host: config.get<string>('DB_HOST', 'localhost'),
                    port: parseInt(config.get<string>('DB_PORT', '3306')),
                    username: config.get<string>('DB_USERNAME', 'root'),
                    password: config.get<string>('DB_PASSWORD', 'password'),
                } as DataSourceOptions;

                return extendedOptions;
            },
        }),
        UsersModule,
        OrdersModule,
    ],
})
export class AppModule { }