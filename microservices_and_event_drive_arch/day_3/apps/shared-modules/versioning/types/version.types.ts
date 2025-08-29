export enum ApiVersion {
    V1 = 'v1',
    V2 = 'v2',
    V3 = 'v3'
}

export enum VersionHeaderType {
    ACCEPT_VERSION = 'Accept-Version',
    API_VERSION = 'API-Version',
    X_VERSION = 'X-Version',
    CUSTOM = 'custom'
}

export type VersionExtractionStrategy = 'header' | 'query' | 'path' | 'subdomain';

export interface VersionExtractionConfig {
    strategy: VersionExtractionStrategy;
    headerName?: string;
    queryParam?: string;
    pathPrefix?: string;
    subdomainPrefix?: string;
}
