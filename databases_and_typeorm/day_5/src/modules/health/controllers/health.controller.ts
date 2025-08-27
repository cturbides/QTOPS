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
    checkDb() { 
        return { status: 'ok', service: 'database', timestamp: new Date().toISOString() }; 
    }

    @Get('content')
    checkContent() { 
        return { status: 'ok', service: 'content', timestamp: new Date().toISOString() }; 
    }
}