import { Module } from '@nestjs/common';
import { HealthController } from './controllers/health.controller';
import { TerminusModule, TypeOrmHealthIndicator } from "@nestjs/terminus";

@Module({
    imports: [TerminusModule],
    controllers: [HealthController],
    providers: [TypeOrmHealthIndicator],
})
export class HealthModule {}