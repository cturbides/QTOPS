import { Module } from '@nestjs/common';
import { TypeOrmQueryLogger } from './loggers/typeorm-query.logger';
import { DatabasePerformanceInterceptor } from './interceptors/database.interceptor';

@Module({
    exports: [DatabasePerformanceInterceptor],
    providers: [DatabasePerformanceInterceptor, TypeOrmQueryLogger],
})
export class PerformanceModule {}