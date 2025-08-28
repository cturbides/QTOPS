import { Controller, Get } from '@nestjs/common';
import { ELearningServiceRegistry } from '../../service-discovery/services/e-learning-registry.service';
import { CATALOG_SERVICE_SUCCESS_RESPONSE, CATALOG_SERVICE_ERROR_RESPONSE } from '../constants/responses';

@Controller('curso-completo')
export class CursoDiscoveryController {
    constructor(
        private readonly serviceRegistry: ELearningServiceRegistry
    ) {}

    @Get('ping-catalog')
    async pingCatalogService() {
        try {
            const response = await this.serviceRegistry.invocarServicioEducativo<any>(
                'catalog-service',
                'api/ping'
            );
            return {
                ...CATALOG_SERVICE_SUCCESS_RESPONSE,
                response
            };
        } catch (error: any) {
            return {
                ...CATALOG_SERVICE_ERROR_RESPONSE,
                error: error.message
            };
        }
    }
}