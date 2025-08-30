// Module
export { VersioningModule } from './versioning.module';

// Services
export { VersionExtractorService } from './services/version-extractor.service';
export { VersionConfigService } from './services/version-config.service';
export { VersionRoutingService } from './services/version-routing.service';

// Controllers
export { VersioningController } from './controllers/versioning.controller';

// Guards & Interceptors
export { VersionGuard } from './guards/version.guard';
export { VersionHeaderInterceptor } from './interceptors/version-header.interceptor';

// Decorators
export {
    Version,
    SupportedVersions,
    VersionExtraction,
    ApiVersioned,
    API_VERSION_KEY,
    SUPPORTED_VERSIONS_KEY,
    VERSION_EXTRACTION_CONFIG_KEY,
} from './decorators/version.decorators';

// Interfaces & Types
export {
    IVersionConfig,
    IServiceVersionConfig,
    IVersionedServiceInstance,
    IVersionRoutingRule,
} from './interfaces/version-config.interface';

export {
    ApiVersion,
    VersionHeaderType,
    VersionExtractionStrategy,
    VersionExtractionConfig,
} from './types/version.types';

// Exceptions
export {
    UnsupportedVersionException,
    DeprecatedVersionException,
    ServiceVersionNotFoundException,
} from './exceptions/version.exceptions';
