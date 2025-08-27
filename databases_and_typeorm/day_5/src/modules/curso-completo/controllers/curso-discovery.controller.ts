import { Controller, Get } from '@nestjs/common';
import { ELearningServiceRegistry } from '../../service-discovery/services/e-learning-registry.service';

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
                success: true,
                message: 'Successfully communicated with catalog service',
                response
            };
        } catch (error: any) {
            return {
                success: false,
                message: 'Failed to communicate with catalog service',
                error: error.message
            };
        }
    }
}