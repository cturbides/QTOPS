import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { VersionExtractorService } from './version-extractor.service';
import { VersionConfigService } from './version-config.service';
import { ConsulService } from '@shared-modules/service-discovery/services/consul.service';
import { IVersionedServiceInstance } from '../interfaces/version-config.interface';
import { UnsupportedVersionException, ServiceVersionNotFoundException, DeprecatedVersionException } from '../exceptions/version.exceptions';
import { ApiVersion, VersionExtractionConfig } from '../types/version.types';

@Injectable()
export class VersionRoutingService {
    constructor(
        private readonly versionExtractor: VersionExtractorService,
        private readonly versionConfig: VersionConfigService,
        private readonly consul: ConsulService,
    ) {}

    async resolveServiceVersion(
        request: Request,
        serviceName: string,
        extractionConfig?: VersionExtractionConfig
    ): Promise<{
        version: string;
        instances: IVersionedServiceInstance[];
        warnings?: string[];
    }> {
        const warnings: string[] = [];
        
        // 1. Extraer versión del request
        let requestedVersion = this.versionExtractor.extractVersion(request, extractionConfig);
        
        // 2. Verificar reglas de enrutamiento basadas en headers de cliente
        const routingRule = this.versionConfig.findMatchingRoutingRule(request.headers as Record<string, string>);
        if (routingRule) {
            requestedVersion = routingRule.targetVersion;
            warnings.push(`Routing rule applied: ${routingRule.headerName}=${routingRule.headerValue} -> ${routingRule.targetVersion}`);
        }

        // 3. Validar que la versión sea soportada
        if (!this.versionConfig.isVersionSupported(serviceName, requestedVersion)) {
            const supportedVersions = this.versionConfig.getSupportedVersions(serviceName);
            
            // Fallback a la versión por defecto si no se soporta la solicitada
            const defaultVersion = this.versionConfig.getDefaultVersion(serviceName);
            warnings.push(`Version ${requestedVersion} not supported, falling back to ${defaultVersion}`);
            requestedVersion = defaultVersion;
        }

        // 4. Verificar si la versión está deprecada
        if (this.versionConfig.isVersionDeprecated(serviceName, requestedVersion)) {
            const versionConfig = this.versionConfig.getVersionConfig(serviceName, requestedVersion);
            warnings.push(`Version ${requestedVersion} is deprecated${versionConfig?.deprecationDate ? ` since ${versionConfig.deprecationDate.toISOString()}` : ''}`);
        }

        // 5. Obtener instancias del servicio para la versión específica
        const instances = await this.getVersionedServiceInstances(serviceName, requestedVersion);
        
        if (!instances || instances.length === 0) {
            throw new ServiceVersionNotFoundException(serviceName, requestedVersion);
        }

        return {
            version: requestedVersion,
            instances,
            warnings: warnings.length > 0 ? warnings : undefined,
        };
    }

    private async getVersionedServiceInstances(
        serviceName: string,
        version: string
    ): Promise<IVersionedServiceInstance[]> {
        // Construir el nombre del servicio versionado
        const versionedServiceName = `${serviceName}-${version}`;
        
        try {
            // Intentar primero con el nombre versionado
            const versionedInstances = await this.consul.getHealthyService(versionedServiceName);
            
            if (versionedInstances && versionedInstances.length > 0) {
                return versionedInstances.map(instance => ({
                    address: instance.address,
                    port: instance.port,
                    version,
                    serviceName: versionedServiceName,
                }));
            }
        } catch (error) {
            // Si no se encuentra el servicio versionado, continuamos
        }

        // Fallback: obtener instancias del servicio base y filtrar por tags
        try {
            const baseInstances = await this.consul.getHealthyService(serviceName);
            
            if (!baseInstances || baseInstances.length === 0) {
                return [];
            }

            // Filtrar instancias por tags de versión
            const versionedInstances = baseInstances.filter(instance => {
                // Verificar si la instancia tiene tags de versión
                const tags = (instance as any).tags || [];
                return tags.includes(`version:${version}`) || tags.includes(`v:${version}`);
            });

            if (versionedInstances.length > 0) {
                return versionedInstances.map(instance => ({
                    address: instance.address,
                    port: instance.port,
                    version,
                    serviceName,
                }));
            }

            // Si no hay instancias específicas de versión, usar todas las instancias
            // (asumiendo que son compatibles con la versión por defecto)
            if (version === this.versionConfig.getDefaultVersion(serviceName)) {
                return baseInstances.map(instance => ({
                    address: instance.address,
                    port: instance.port,
                    version,
                    serviceName,
                }));
            }

            return [];
        } catch (error) {
            console.error(`Error getting instances for service ${serviceName}:`, error);
            return [];
        }
    }

    generateVersionedUrl(baseUrl: string, version: string, path: string): string {
        // Si el path ya incluye una versión, no modificarlo
        if (path.match(/^\/v\d+/)) {
            return `${baseUrl}${path}`;
        }
        
        // Si es la versión por defecto, usar el path tal como está
        if (version === ApiVersion.V1) {
            return `${baseUrl}${path}`;
        }
        
        // Para otras versiones, extraer el path base y prefijarlo con la versión
        const pathSegments = path.split('/').filter(Boolean);
        if (pathSegments.length > 0) {
            // Construir el path versionado: /v2/recurso/subpath
            const resource = pathSegments[0];
            const subPath = pathSegments.slice(1).join('/');
            const versionedPath = subPath ? `/${version}/${resource}/${subPath}` : `/${version}/${resource}`;
            return `${baseUrl}${versionedPath}`;
        }
        
        return `${baseUrl}${path}`;
    }

    extractVersionFromPath(path: string): { version?: string; cleanPath: string } {
        const versionMatch = path.match(/^\/v(\d+)(\/.*)?$/);
        
        if (versionMatch) {
            const version = `v${versionMatch[1]}`;
            const cleanPath = versionMatch[2] || '/';
            return { version, cleanPath };
        }
        
        return { cleanPath: path };
    }
}
