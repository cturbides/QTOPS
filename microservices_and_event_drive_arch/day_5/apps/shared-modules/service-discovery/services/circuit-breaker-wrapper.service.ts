import { Injectable, Logger } from '@nestjs/common';
import { CircuitBreakerService } from './circuit-breaker.service';
import { CircuitBreakerConfig, CircuitState } from '../interfaces/circuit-breaker.interfaces';
import { CircuitTimeoutException } from '../exceptions/circuit-breaker.exception';
import { ELearningObservabilityService } from '@shared-modules/observability';

@Injectable()
export class CircuitBreakerWrapper {
    constructor(
        private readonly logger: Logger, 
        private readonly circuitBreaker: CircuitBreakerService,
        private readonly observability?: ELearningObservabilityService
    ) { }

    async execute<T>(
        serviceName: string,
        operation: () => Promise<T>,
        config?: Partial<CircuitBreakerConfig>
    ): Promise<T> {
        // Registrar el circuit breaker si no existe
        if (!this.circuitBreaker.getCircuitState(serviceName)) {
            this.circuitBreaker.registerCircuit(serviceName, config);
        }

        const currentState = this.circuitBreaker.getCircuitState(serviceName);
        
        // Monitor circuit breaker state if observability is available
        if (this.observability && currentState) {
            const stateString = currentState === CircuitState.CLOSED ? 'closed' : 
                               currentState === CircuitState.OPEN ? 'open' : 'half-open';
            this.observability.monitorCircuitBreakerState(
                serviceName,
                stateString as 'closed' | 'open' | 'half-open'
            );
        }

        try {
            this.circuitBreaker.canExecute(serviceName);
        } catch (error) {
            this.logger.warn(`Circuit breaker prevented execution for service: ${serviceName}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }

        try {
            const timeoutMs = config?.timeout || 10000;
            const result = await this.executeWithTimeout(operation, timeoutMs);

            this.circuitBreaker.recordSuccess(serviceName);
            this.logger.debug(`Successful execution for service: ${serviceName}`);

            return result;
        } catch (error) {
            this.circuitBreaker.recordFailure(serviceName, error as Error);

            // Monitor state change after failure
            const newState = this.circuitBreaker.getCircuitState(serviceName);
            if (this.observability && newState && newState !== currentState) {
                const stateString = newState === CircuitState.CLOSED ? 'closed' : 
                                   newState === CircuitState.OPEN ? 'open' : 'half-open';
                this.observability.monitorCircuitBreakerState(
                    serviceName,
                    stateString as 'closed' | 'open' | 'half-open'
                );
            }

            if (error instanceof Error && error.name === 'TimeoutError') {
                throw new CircuitTimeoutException(serviceName, config?.timeout || 10000);
            }

            throw error;
        }
    }

    private async executeWithTimeout<T>(
        operation: () => Promise<T>,
        timeoutMs: number
    ): Promise<T> {
        return Promise.race([
            operation(),
            new Promise<never>((_, reject) => {
                setTimeout(() => {
                    const error = new Error(`Operation timed out after ${timeoutMs}ms`);
                    error.name = 'TimeoutError';
                    reject(error);
                }, timeoutMs);
            })
        ]);
    }

    getCircuitState(serviceName: string) {
        return this.circuitBreaker.getCircuitState(serviceName);
    }

    getMetrics(serviceName: string) {
        return this.circuitBreaker.getMetrics(serviceName);
    }

    getAllMetrics() {
        return this.circuitBreaker.getAllMetrics();
    }

    reset(serviceName: string) {
        this.circuitBreaker.reset(serviceName);
        this.logger.log(`Circuit breaker manually reset for service: ${serviceName}`);
    }
}
