import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { ApiVersion, VersionExtractionConfig, VersionExtractionStrategy } from '../types/version.types';

@Injectable()
export class VersionExtractorService {
    private readonly defaultVersion = ApiVersion.V1;
    
    extractVersion(
        request: Request,
        config: VersionExtractionConfig = { strategy: 'header', headerName: 'API-Version' }
    ): string {
        const { strategy, headerName, queryParam, pathPrefix, subdomainPrefix } = config;

        let version: string | undefined;

        switch (strategy) {
            case 'header':
                version = this.extractFromHeader(request, headerName || 'API-Version');
                break;
            case 'query':
                version = this.extractFromQuery(request, queryParam || 'version');
                break;
            case 'path':
                version = this.extractFromPath(request, pathPrefix || '/v');
                break;
            case 'subdomain':
                version = this.extractFromSubdomain(request, subdomainPrefix || 'v');
                break;
            default:
                version = this.extractFromHeader(request, 'API-Version');
        }

        return this.normalizeVersion(version || this.defaultVersion);
    }

    private extractFromHeader(request: Request, headerName: string): string | undefined {
        const headerValue = request.headers[headerName.toLowerCase()] as string;
        if (headerValue) {
            return headerValue;
        }

        // Fallback headers
        const fallbackHeaders = [
            'accept-version',
            'x-version',
            'x-api-version',
            'version'
        ];

        for (const fallback of fallbackHeaders) {
            const value = request.headers[fallback] as string;
            if (value) {
                return value;
            }
        }

        return undefined;
    }

    private extractFromQuery(request: Request, queryParam: string): string | undefined {
        return request.query[queryParam] as string;
    }

    private extractFromPath(request: Request, pathPrefix: string): string | undefined {
        const path = request.path;
        const regex = new RegExp(`${pathPrefix}(\\d+)`);
        const match = path.match(regex);
        return match ? `v${match[1]}` : undefined;
    }

    private extractFromSubdomain(request: Request, subdomainPrefix: string): string | undefined {
        const hostname = request.hostname;
        const regex = new RegExp(`^${subdomainPrefix}(\\d+)\\.`);
        const match = hostname.match(regex);
        return match ? `v${match[1]}` : undefined;
    }

    private normalizeVersion(version: string): string {
        // Normalize version format (e.g., "1" -> "v1", "2.0" -> "v2")
        const cleaned = version.toLowerCase().replace(/[^0-9\.]/g, '');
        const majorVersion = cleaned.split('.')[0];
        return `v${majorVersion}`;
    }

    getSupportedVersions(): string[] {
        return Object.values(ApiVersion);
    }

    isVersionSupported(version: string): boolean {
        const normalized = this.normalizeVersion(version);
        return this.getSupportedVersions().includes(normalized);
    }
}
