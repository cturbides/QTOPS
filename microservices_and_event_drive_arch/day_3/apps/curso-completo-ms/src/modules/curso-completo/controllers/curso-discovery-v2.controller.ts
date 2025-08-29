import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { ApiVersion } from '@shared-modules/versioning/types/version.types';
import { Version } from '@shared-modules/versioning/decorators/version.decorators';
import { VersionHeaderInterceptor } from '@shared-modules/versioning/interceptors/version-header.interceptor';

@Controller('v2/curso-completo')
@UseInterceptors(VersionHeaderInterceptor)
@Version(ApiVersion.V2)
export class CursoDiscoveryV2Controller {
    
    @Get('ping')
    async ping() {
        return {
            status: 'healthy',
            service: 'curso-completo-ms',
            version: ApiVersion.V2,
            timestamp: new Date().toISOString(),
            message: 'Curso Completo microservice V2 is running',
            features: ['enhanced-discovery', 'version-aware-responses'],
        };
    }

    @Get('health')
    async health() {
        return {
            status: 'healthy',
            service: 'curso-completo-ms',
            version: ApiVersion.V2,
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            environment: process.env.NODE_ENV || 'development',
        };
    }

    @Get('version')
    async version() {
        return {
            version: ApiVersion.V2,
            service: 'curso-completo-ms',
            timestamp: new Date().toISOString(),
            compatibility: {
                v1: true,
                v2: true,
            },
            deprecations: [],
            enhancements: [
                'detailed-health-checks',
                'enhanced-error-responses',
                'version-aware-routing',
            ],
        };
    }
}
