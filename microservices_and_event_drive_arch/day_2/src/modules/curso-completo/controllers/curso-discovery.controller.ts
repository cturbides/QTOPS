import { Controller, Get } from '@nestjs/common';
import { ELearningServiceRegistry } from '../../service-discovery/services/e-learning-registry.service';
import { CircuitOpenException, CircuitTimeoutException } from '../../service-discovery/exceptions/circuit-breaker.exception';
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
                response,
                circuitState: this.serviceRegistry.getCircuitBreakerState('catalog-service')
            };
        } catch (error: any) {
            let errorType = 'UNKNOWN';
            let errorDetails = error.message;

            if (error instanceof CircuitOpenException) {
                errorType = 'CIRCUIT_OPEN';
                errorDetails = `Circuit breaker is open. Service unavailable until next retry.`;
            } else if (error instanceof CircuitTimeoutException) {
                errorType = 'TIMEOUT';
                errorDetails = `Service request timed out.`;
            }

            return {
                ...CATALOG_SERVICE_ERROR_RESPONSE,
                errorType,
                error: errorDetails,
                circuitState: this.serviceRegistry.getCircuitBreakerState('catalog-service'),
                metrics: this.serviceRegistry.getCircuitBreakerMetrics('catalog-service')
            };
        }
    }

    @Get('ping-catalog-force')
    async pingCatalogServiceForceFailure() {
        try {
            // Intentar llamar a un endpoint que no existe para forzar falla
            const response = await this.serviceRegistry.invocarServicioEducativo<any>(
                'catalog-service',
                'api/nonexistent-endpoint'
            );
            return {
                ...CATALOG_SERVICE_SUCCESS_RESPONSE,
                response,
                circuitState: this.serviceRegistry.getCircuitBreakerState('catalog-service')
            };
        } catch (error: any) {
            let errorType = 'UNKNOWN';
            let errorDetails = error.message;

            if (error instanceof CircuitOpenException) {
                errorType = 'CIRCUIT_OPEN';
                errorDetails = `Circuit breaker is open. Service unavailable until next retry.`;
            } else if (error instanceof CircuitTimeoutException) {
                errorType = 'TIMEOUT';
                errorDetails = `Service request timed out.`;
            }

            return {
                ...CATALOG_SERVICE_ERROR_RESPONSE,
                errorType,
                error: errorDetails,
                circuitState: this.serviceRegistry.getCircuitBreakerState('catalog-service'),
                metrics: this.serviceRegistry.getCircuitBreakerMetrics('catalog-service'),
                note: 'This endpoint intentionally calls a non-existent service endpoint to demonstrate circuit breaker behavior'
            };
        }
    }
}