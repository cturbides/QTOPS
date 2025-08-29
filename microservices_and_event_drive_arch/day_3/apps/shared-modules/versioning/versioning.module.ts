import { Module, Global } from '@nestjs/common';
import { VersionExtractorService } from './services/version-extractor.service';
import { VersionConfigService } from './services/version-config.service';
import { VersionRoutingService } from './services/version-routing.service';
import { VersioningController } from './controllers/versioning.controller';
import { VersionGuard } from './guards/version.guard';
import { VersionHeaderInterceptor } from './interceptors/version-header.interceptor';
import { ServiceDiscoveryModule } from '../service-discovery/service-discovery.module';

@Global()
@Module({
    imports: [ServiceDiscoveryModule],
    providers: [
        VersionExtractorService,
        VersionConfigService,
        VersionRoutingService,
        VersionGuard,
        VersionHeaderInterceptor,
    ],
    controllers: [VersioningController],
    exports: [
        VersionExtractorService,
        VersionConfigService,
        VersionRoutingService,
        VersionGuard,
        VersionHeaderInterceptor,
    ],
})
export class VersioningModule {}
