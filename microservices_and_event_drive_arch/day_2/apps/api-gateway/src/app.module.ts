import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from './modules/health/health.module';
import { PerformanceModule } from './modules/performance/performance.module';
import { ServiceDiscoveryModule } from './modules/service-discovery/service-discovery.module';
import { ProxyModule } from './modules/proxy/proxy.module';

// Database configuration for API Gateway
const typeOrmConfig = {
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

@Module({
    imports: [
        TypeOrmModule.forRoot(typeOrmConfig),
        HealthModule,
        PerformanceModule,
        ServiceDiscoveryModule,
        ProxyModule,
    ]
})
export class AppModule { }