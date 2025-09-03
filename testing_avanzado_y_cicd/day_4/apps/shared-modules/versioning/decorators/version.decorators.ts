import { SetMetadata } from '@nestjs/common';
import { ApiVersion } from '../types/version.types';

export const API_VERSION_KEY = 'api_version';
export const SUPPORTED_VERSIONS_KEY = 'supported_versions';
export const VERSION_EXTRACTION_CONFIG_KEY = 'version_extraction_config';

/**
 * Decorador para especificar la versión de la API que maneja un controlador o método
 */
export const Version = (version: ApiVersion | string) => SetMetadata(API_VERSION_KEY, version);

/**
 * Decorador para especificar múltiples versiones soportadas
 */
export const SupportedVersions = (...versions: (ApiVersion | string)[]) => 
    SetMetadata(SUPPORTED_VERSIONS_KEY, versions);

/**
 * Decorador para configurar cómo extraer la versión del request
 */
export const VersionExtraction = (config: any) => 
    SetMetadata(VERSION_EXTRACTION_CONFIG_KEY, config);

/**
 * Decorador combinado para facilitar la configuración
 */
export const ApiVersioned = (options: {
    version?: ApiVersion | string;
    supportedVersions?: (ApiVersion | string)[];
    extractionConfig?: any;
}) => {
    return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
        if (options.version) {
            SetMetadata(API_VERSION_KEY, options.version)(target, propertyKey, descriptor);
        }
        if (options.supportedVersions) {
            SetMetadata(SUPPORTED_VERSIONS_KEY, options.supportedVersions)(target, propertyKey, descriptor);
        }
        if (options.extractionConfig) {
            SetMetadata(VERSION_EXTRACTION_CONFIG_KEY, options.extractionConfig)(target, propertyKey, descriptor);
        }
    };
};
