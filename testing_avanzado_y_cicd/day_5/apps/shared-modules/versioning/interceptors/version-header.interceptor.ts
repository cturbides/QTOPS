import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs'; 
import { map } from 'rxjs/operators'; 
import { Request, Response } from 'express';
import { VersionExtractorService } from '../services/version-extractor.service';
import { VersionConfigService } from '../services/version-config.service';

@Injectable()
export class VersionHeaderInterceptor implements NestInterceptor {
    constructor(
        private readonly versionExtractor: VersionExtractorService,
        private readonly versionConfig: VersionConfigService,
    ) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest<Request>();
        const response = context.switchToHttp().getResponse<Response>();

        // Extraer versión del request
        const version = this.versionExtractor.extractVersion(request);
        
        // Agregar headers de versión a la respuesta
        response.setHeader('API-Version', version);
        response.setHeader('X-API-Version', version);
        response.setHeader('Vary', 'API-Version, Accept-Version, X-Version');

        // Verificar si la versión está deprecada
        const serviceName = this.extractServiceNameFromPath(request.path);
        if (serviceName && this.versionConfig.isVersionDeprecated(serviceName, version)) {
            const versionConfig = this.versionConfig.getVersionConfig(serviceName, version);
            response.setHeader('Warning', `299 - "API version ${version} is deprecated"`);
            
            if (versionConfig?.endOfLifeDate) {
                response.setHeader('X-API-Deprecation-Date', versionConfig.endOfLifeDate.toISOString());
            }
        }

        return next.handle().pipe(
            map((data) => {
                // Envolver la respuesta con metadatos de versión si es necesario
                if (data && typeof data === 'object') {
                    return {
                        ...data,
                        _metadata: {
                            apiVersion: version,
                            timestamp: new Date().toISOString(),
                            ...(data._metadata || {}),
                        },
                    };
                }
                return data;
            }),
        );
    }

    private extractServiceNameFromPath(path: string): string | undefined {
        // Extraer el nombre del servicio del path (ej: /cursos -> curso-completo)
        const pathSegments = path.split('/').filter(Boolean);
        if (pathSegments.length === 0) return undefined;

        const firstSegment = pathSegments[0];
        
        // Mapeo de rutas a nombres de servicios
        const routeToServiceMap: Record<string, string> = {
            'cursos': 'course-service',
            'curso-completo': 'course-service',
        };

        return routeToServiceMap[firstSegment];
    }
}
