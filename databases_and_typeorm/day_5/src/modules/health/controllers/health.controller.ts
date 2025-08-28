import { Controller, Get } from "@nestjs/common";
import { HealthCheck, HealthCheckService, TypeOrmHealthIndicator } from "@nestjs/terminus";

@Controller('health')
export class HealthController {
    constructor(
        private readonly health: HealthCheckService,
        private readonly db: TypeOrmHealthIndicator,
    ) { }

    @Get()
    @HealthCheck()
    check() {
        return this.health.check([
            async () => this.db.pingCheck('database'),
        ]);
    }

    @Get('database')
    @HealthCheck()
    checkDb() { 
        return this.health.check([
            async () => this.db.pingCheck('database'),
        ]);
    }

    @Get('content')
    @HealthCheck()
    checkContent() { 
        return this.health.check([
            async () => this.db.pingCheck('database'),
            async () => ({ 'content-service': { status: 'up', message: 'Content is accessible' } })
        ]);
    }
}