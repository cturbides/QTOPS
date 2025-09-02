export interface IVersionConfig {
    version: string;
    isDefault?: boolean;
    isDeprecated?: boolean;
    deprecationDate?: Date;
    endOfLifeDate?: Date;
    supportedUntil?: Date;
}

export interface IServiceVersionConfig {
    serviceName: string;
    versions: IVersionConfig[];
    defaultVersion: string;
}

export interface IVersionedServiceInstance {
    address: string;
    port: number;
    version: string;
    serviceName: string;
}

export interface IVersionRoutingRule {
    headerName: string;
    headerValue: string;
    targetVersion: string;
    priority: number;
}
