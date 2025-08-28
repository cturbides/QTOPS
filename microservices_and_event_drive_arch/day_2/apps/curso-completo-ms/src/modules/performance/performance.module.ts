import { Module } from '@nestjs/common';
import { TypeOrmQueryLogger } from '@performance/loggers/typeorm-query.logger';
import { DatabasePerformanceInterceptor } from '@performance/interceptors/database.interceptor';

@Module({
    exports: [DatabasePerformanceInterceptor],
    providers: [DatabasePerformanceInterceptor, TypeOrmQueryLogger],
})
export class PerformanceModule {}
