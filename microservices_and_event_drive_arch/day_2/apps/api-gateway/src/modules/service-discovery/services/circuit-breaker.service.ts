import { Injectable, Logger } from '@nestjs/common';
import { CircuitOpenException } from '@modules/service-discovery/exceptions/circuit-breaker.exception';
import { DEFAULT_CIRCUIT_BREAKER_CONFIG } from '@modules/service-discovery/constants/circuit-breaker.constants';

import {
    CircuitState,
    CircuitBreakerConfig,
    CircuitBreakerState,
    CircuitBreakerMetrics,
} from '@modules/service-discovery/interfaces/circuit-breaker.interfaces';

@Injectable()
export class CircuitBreakerService {
    private readonly circuits = new Map<string, CircuitBreakerState>();
    private readonly metrics = new Map<string, CircuitBreakerMetrics>();
    private readonly configs = new Map<string, CircuitBreakerConfig>();

    constructor(
        private readonly logger: Logger,
    ) {
        this.logger.log('Circuit Breaker Service initialized');
    }

    registerCircuit(serviceName: string, config?: Partial<CircuitBreakerConfig>): void {
        const finalConfig = { ...DEFAULT_CIRCUIT_BREAKER_CONFIG, ...config };

        this.configs.set(serviceName, finalConfig);

        this.circuits.set(serviceName, {
            failures: 0,
            lastFailureTime: 0,
            nextAttemptTime: 0,
            state: CircuitState.CLOSED
        });

        this.metrics.set(serviceName, {
            totalRequests: 0,
            failedRequests: 0,
            circuitOpenEvents: 0,
            circuitCloseEvents: 0,
            successfulRequests: 0,
            circuitHalfOpenEvents: 0,
        });

        this.logger.log(`Circuit breaker registered for service: ${serviceName}`, finalConfig);
    }

    canExecute(serviceName: string): void {
        const now = Date.now();
        const circuit = this.getOrCreateCircuit(serviceName);

        switch (circuit.state) {
            case CircuitState.CLOSED:
                // Circuito cerrado - permitir todas las llamadas
                return;

            case CircuitState.OPEN:
                // Verificar si es tiempo de intentar nuevamente
                if (now >= circuit.nextAttemptTime) {
                    this.transitionToHalfOpen(serviceName);
                    return;
                }
                throw new CircuitOpenException(serviceName, circuit.nextAttemptTime);

            case CircuitState.HALF_OPEN:
                // En half-open, solo permitir una llamada a la vez
                // Si hay otra llamada en progreso, rechazar
                return;
        }
    }

    recordSuccess(serviceName: string): void {
        const circuit = this.getOrCreateCircuit(serviceName);
        const metrics = this.getOrCreateMetrics(serviceName);

        metrics.totalRequests++;
        metrics.successfulRequests++;

        // Si estaba en half-open o tenía fallas, cerrar el circuito
        if (circuit.state === CircuitState.HALF_OPEN || circuit.failures > 0) {
            this.transitionToClosed(serviceName);
        }

        circuit.failures = 0;
        this.circuits.set(serviceName, circuit);
        this.metrics.set(serviceName, metrics);

        this.logger.debug(`Success recorded for service: ${serviceName}`);
    }

    recordFailure(serviceName: string, error?: Error): void {
        const now = Date.now();

        const config = this.getOrCreateConfig(serviceName);
        const circuit = this.getOrCreateCircuit(serviceName);
        const metrics = this.getOrCreateMetrics(serviceName);

        metrics.totalRequests++;
        metrics.failedRequests++;

        circuit.failures++;
        circuit.lastFailureTime = now;

        // Verificar si debe abrir el circuito
        if (circuit.failures >= config.failureThreshold) {
            this.transitionToOpen(serviceName);
        }

        this.circuits.set(serviceName, circuit);
        this.metrics.set(serviceName, metrics);

        this.logger.warn(`Failure recorded for service: ${serviceName}. Failures: ${circuit.failures}/${config.failureThreshold}`, {
            error: error?.message,
            circuitState: circuit.state
        });
    }

    getCircuitState(serviceName: string): CircuitState {
        return this.getOrCreateCircuit(serviceName).state;
    }

    getMetrics(serviceName: string): CircuitBreakerMetrics {
        return { ...this.getOrCreateMetrics(serviceName) };
    }

    getAllMetrics(): Record<string, CircuitBreakerMetrics> {
        const result: Record<string, CircuitBreakerMetrics> = {};
        for (const [serviceName, metrics] of this.metrics) {
            result[serviceName] = { ...metrics };
        }
        return result;
    }

    reset(serviceName: string): void {
        this.circuits.set(serviceName, {
            failures: 0,
            lastFailureTime: 0,
            nextAttemptTime: 0,
            state: CircuitState.CLOSED
        });

        this.logger.log(`Circuit breaker reset for service: ${serviceName}`);
    }

    private getOrCreateCircuit(serviceName: string): CircuitBreakerState {
        if (!this.circuits.has(serviceName)) {
            this.registerCircuit(serviceName);
        }

        return this.circuits.get(serviceName)!;
    }

    private getOrCreateConfig(serviceName: string): CircuitBreakerConfig {
        if (!this.configs.has(serviceName)) {
            this.registerCircuit(serviceName);
        }

        return this.configs.get(serviceName)!;
    }

    private getOrCreateMetrics(serviceName: string): CircuitBreakerMetrics {
        if (!this.metrics.has(serviceName)) {
            this.registerCircuit(serviceName);
        }

        return this.metrics.get(serviceName)!;
    }

    private transitionToOpen(serviceName: string): void {
        const config = this.getOrCreateConfig(serviceName);
        const circuit = this.getOrCreateCircuit(serviceName);
        const metrics = this.getOrCreateMetrics(serviceName);

        circuit.state = CircuitState.OPEN;
        circuit.nextAttemptTime = Date.now() + config.retryAttemptTimeout;

        metrics.circuitOpenEvents++;

        this.circuits.set(serviceName, circuit);
        this.metrics.set(serviceName, metrics);

        this.logger.warn(`Circuit breaker OPENED for service: ${serviceName}. Next attempt at: ${new Date(circuit.nextAttemptTime).toISOString()}`);
    }

    private transitionToHalfOpen(serviceName: string): void {
        const circuit = this.getOrCreateCircuit(serviceName);
        const config = this.getOrCreateConfig(serviceName);
        const metrics = this.getOrCreateMetrics(serviceName);

        circuit.state = CircuitState.HALF_OPEN;
        circuit.nextAttemptTime = Date.now() + config.halfOpenRetryTimeout;
        metrics.circuitHalfOpenEvents++;

        this.circuits.set(serviceName, circuit);
        this.metrics.set(serviceName, metrics);

        this.logger.log(`Circuit breaker transitioned to HALF_OPEN for service: ${serviceName}`);
    }

    private transitionToClosed(serviceName: string): void {
        const circuit = this.getOrCreateCircuit(serviceName);
        const metrics = this.getOrCreateMetrics(serviceName);

        const wasOpen = circuit.state !== CircuitState.CLOSED;
        circuit.state = CircuitState.CLOSED;
        circuit.failures = 0;
        circuit.nextAttemptTime = 0;

        if (wasOpen) {
            metrics.circuitCloseEvents++;
        }

        this.circuits.set(serviceName, circuit);
        this.metrics.set(serviceName, metrics);

        if (wasOpen) {
            this.logger.log(`Circuit breaker CLOSED for service: ${serviceName}`);
        }
    }
}
