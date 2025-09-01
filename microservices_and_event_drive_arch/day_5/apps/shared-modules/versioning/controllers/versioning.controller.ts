import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { VersionConfigService } from '../services/version-config.service';
import { IServiceVersionConfig, IVersionRoutingRule } from '../interfaces/version-config.interface';

@Controller('api/versioning')
export class VersioningController {
    constructor(private readonly versionConfig: VersionConfigService) {}

    @Get('services')
    getAllServiceConfigs(): IServiceVersionConfig[] {
        return this.versionConfig.getAllServiceConfigs();
    }

    @Get('services/:serviceName')
    getServiceConfig(@Param('serviceName') serviceName: string) {
        const config = this.versionConfig.getServiceVersionConfig(serviceName);
        if (!config) {
            return {
                error: `Service ${serviceName} not found`,
                availableServices: this.versionConfig.getAllServiceConfigs().map(s => s.serviceName),
            };
        }
        return config;
    }

    @Get('services/:serviceName/versions')
    getSupportedVersions(@Param('serviceName') serviceName: string): {
        serviceName: string;
        supportedVersions: string[];
        defaultVersion: string;
    } {
        const supportedVersions = this.versionConfig.getSupportedVersions(serviceName);
        const defaultVersion = this.versionConfig.getDefaultVersion(serviceName);
        
        return {
            serviceName,
            supportedVersions,
            defaultVersion,
        };
    }

    @Get('services/:serviceName/versions/:version')
    getVersionConfig(@Param('serviceName') serviceName: string, @Param('version') version: string) {
        const versionConfig = this.versionConfig.getVersionConfig(serviceName, version);
        if (!versionConfig) {
            return {
                error: `Version ${version} not found for service ${serviceName}`,
                supportedVersions: this.versionConfig.getSupportedVersions(serviceName),
            };
        }
        return {
            serviceName,
            version,
            config: versionConfig,
        };
    }

    @Get('routing-rules')
    getRoutingRules(): IVersionRoutingRule[] {
        return this.versionConfig.getRoutingRules();
    }

    @Post('services/:serviceName')
    registerServiceConfig(
        @Param('serviceName') serviceName: string,
        @Body() config: Omit<IServiceVersionConfig, 'serviceName'>
    ): { message: string; config: IServiceVersionConfig } {
        const serviceConfig: IServiceVersionConfig = {
            serviceName,
            ...config,
        };
        
        this.versionConfig.registerServiceVersionConfig(serviceConfig);
        
        return {
            message: `Service ${serviceName} configuration registered successfully`,
            config: serviceConfig,
        };
    }

    @Post('routing-rules')
    addRoutingRule(@Body() rule: IVersionRoutingRule): { message: string; rule: IVersionRoutingRule } {
        this.versionConfig.addRoutingRule(rule);
        
        return {
            message: 'Routing rule added successfully',
            rule,
        };
    }

    @Get('health')
    getHealthStatus() {
        const services = this.versionConfig.getAllServiceConfigs();
        
        return {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            versioning: {
                totalServices: services.length,
                services: services.map(s => ({
                    name: s.serviceName,
                    versions: s.versions.length,
                    defaultVersion: s.defaultVersion,
                })),
                totalRoutingRules: this.versionConfig.getRoutingRules().length,
            },
        };
    }
}
