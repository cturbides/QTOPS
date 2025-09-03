import { Injectable } from '@nestjs/common';
import { IServiceVersionConfig, IVersionConfig, IVersionRoutingRule } from '../interfaces/version-config.interface';
import { ApiVersion } from '../types/version.types';

@Injectable()
export class VersionConfigService {
    private serviceConfigs: Map<string, IServiceVersionConfig> = new Map();
    private routingRules: IVersionRoutingRule[] = [];

    constructor() {
        this.initializeDefaultConfigurations();
    }

    private initializeDefaultConfigurations(): void {
        // Configuración para el servicio curso-completo
        this.registerServiceVersionConfig({
            serviceName: 'course-service',
            defaultVersion: ApiVersion.V1,
            versions: [
                {
                    version: ApiVersion.V1,
                    isDefault: true,
                    isDeprecated: false,
                },
                {
                    version: ApiVersion.V2,
                    isDefault: false,
                    isDeprecated: false,
                }
            ]
        });

        // Reglas de enrutamiento basadas en headers de clientes
        this.addRoutingRule({
            headerName: 'User-Agent',
            headerValue: 'mobile-app',
            targetVersion: ApiVersion.V2,
            priority: 1
        });

        this.addRoutingRule({
            headerName: 'Client-Type',
            headerValue: 'web-app',
            targetVersion: ApiVersion.V1,
            priority: 2
        });

        this.addRoutingRule({
            headerName: 'X-Client-Version',
            headerValue: '2.0',
            targetVersion: ApiVersion.V2,
            priority: 3
        });
    }

    registerServiceVersionConfig(config: IServiceVersionConfig): void {
        this.serviceConfigs.set(config.serviceName, config);
    }

    getServiceVersionConfig(serviceName: string): IServiceVersionConfig | undefined {
        return this.serviceConfigs.get(serviceName);
    }

    getVersionConfig(serviceName: string, version: string): IVersionConfig | undefined {
        const serviceConfig = this.getServiceVersionConfig(serviceName);
        if (!serviceConfig) return undefined;

        return serviceConfig.versions.find(v => v.version === version);
    }

    isVersionSupported(serviceName: string, version: string): boolean {
        const versionConfig = this.getVersionConfig(serviceName, version);
        return !!versionConfig;
    }

    isVersionDeprecated(serviceName: string, version: string): boolean {
        const versionConfig = this.getVersionConfig(serviceName, version);
        return versionConfig?.isDeprecated || false;
    }

    getDefaultVersion(serviceName: string): string {
        const serviceConfig = this.getServiceVersionConfig(serviceName);
        return serviceConfig?.defaultVersion || ApiVersion.V1;
    }

    getSupportedVersions(serviceName: string): string[] {
        const serviceConfig = this.getServiceVersionConfig(serviceName);
        return serviceConfig?.versions.map(v => v.version) || [ApiVersion.V1];
    }

    addRoutingRule(rule: IVersionRoutingRule): void {
        this.routingRules.push(rule);
        // Ordenar por prioridad
        this.routingRules.sort((a, b) => a.priority - b.priority);
    }

    getRoutingRules(): IVersionRoutingRule[] {
        return [...this.routingRules];
    }

    findMatchingRoutingRule(headers: Record<string, string | string[]>): IVersionRoutingRule | undefined {
        for (const rule of this.routingRules) {
            const headerValue = headers[rule.headerName.toLowerCase()];
            const valueToMatch = Array.isArray(headerValue) ? headerValue[0] : headerValue;
            
            if (valueToMatch && valueToMatch.includes(rule.headerValue)) {
                return rule;
            }
        }
        return undefined;
    }

    getAllServiceConfigs(): IServiceVersionConfig[] {
        return Array.from(this.serviceConfigs.values());
    }
}
