import {
    Injectable,
    CanActivate,
    ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { VersionExtractorService } from '../services/version-extractor.service';
import { VersionConfigService } from '../services/version-config.service';
import { UnsupportedVersionException } from '../exceptions/version.exceptions';
import { 
    API_VERSION_KEY, 
    SUPPORTED_VERSIONS_KEY, 
    VERSION_EXTRACTION_CONFIG_KEY 
} from '../decorators/version.decorators';

@Injectable()
export class VersionGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private readonly versionExtractor: VersionExtractorService,
        private readonly versionConfig: VersionConfigService,
    ) {}

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();
        
        // Obtener metadatos del controlador/método
        const targetVersion = this.reflector.getAllAndOverride<string>(API_VERSION_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        const supportedVersions = this.reflector.getAllAndOverride<string[]>(SUPPORTED_VERSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        const extractionConfig = this.reflector.getAllAndOverride<any>(VERSION_EXTRACTION_CONFIG_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // Si no hay metadatos de versión, permitir el acceso
        if (!targetVersion && !supportedVersions) {
            return true;
        }

        // Extraer versión del request
        const requestedVersion = this.versionExtractor.extractVersion(request, extractionConfig);

        // Validar versión específica
        if (targetVersion && requestedVersion !== targetVersion) {
            throw new UnsupportedVersionException(requestedVersion, [targetVersion]);
        }

        // Validar versiones soportadas
        if (supportedVersions && !supportedVersions.includes(requestedVersion)) {
            throw new UnsupportedVersionException(requestedVersion, supportedVersions);
        }

        // Adicionar la versión al request para uso posterior
        (request as any).apiVersion = requestedVersion;

        return true;
    }
}
