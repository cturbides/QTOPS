"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreakerService = void 0;
const common_1 = require("@nestjs/common");
const circuit_breaker_exception_1 = require("../exceptions/circuit-breaker.exception");
const circuit_breaker_constants_1 = require("../constants/circuit-breaker.constants");
const circuit_breaker_interfaces_1 = require("../interfaces/circuit-breaker.interfaces");
let CircuitBreakerService = class CircuitBreakerService {
    constructor(logger) {
        this.logger = logger;
        this.circuits = new Map();
        this.metrics = new Map();
        this.configs = new Map();
        this.logger.log('Circuit Breaker Service initialized');
    }
    registerCircuit(serviceName, config) {
        const finalConfig = { ...circuit_breaker_constants_1.DEFAULT_CIRCUIT_BREAKER_CONFIG, ...config };
        this.configs.set(serviceName, finalConfig);
        this.circuits.set(serviceName, {
            failures: 0,
            lastFailureTime: 0,
            nextAttemptTime: 0,
            state: circuit_breaker_interfaces_1.CircuitState.CLOSED
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
    canExecute(serviceName) {
        const now = Date.now();
        const circuit = this.getOrCreateCircuit(serviceName);
        switch (circuit.state) {
            case circuit_breaker_interfaces_1.CircuitState.CLOSED:
                // Circuito cerrado - permitir todas las llamadas
                return;
            case circuit_breaker_interfaces_1.CircuitState.OPEN:
                // Verificar si es tiempo de intentar nuevamente
                if (now >= circuit.nextAttemptTime) {
                    this.transitionToHalfOpen(serviceName);
                    return;
                }
                throw new circuit_breaker_exception_1.CircuitOpenException(serviceName, circuit.nextAttemptTime);
            case circuit_breaker_interfaces_1.CircuitState.HALF_OPEN:
                // En half-open, solo permitir una llamada a la vez
                // Si hay otra llamada en progreso, rechazar
                return;
        }
    }
    recordSuccess(serviceName) {
        const circuit = this.getOrCreateCircuit(serviceName);
        const metrics = this.getOrCreateMetrics(serviceName);
        metrics.totalRequests++;
        metrics.successfulRequests++;
        // Si estaba en half-open o tenía fallas, cerrar el circuito
        if (circuit.state === circuit_breaker_interfaces_1.CircuitState.HALF_OPEN || circuit.failures > 0) {
            this.transitionToClosed(serviceName);
        }
        circuit.failures = 0;
        this.circuits.set(serviceName, circuit);
        this.metrics.set(serviceName, metrics);
        this.logger.debug(`Success recorded for service: ${serviceName}`);
    }
    recordFailure(serviceName, error) {
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
    getCircuitState(serviceName) {
        return this.getOrCreateCircuit(serviceName).state;
    }
    getMetrics(serviceName) {
        return { ...this.getOrCreateMetrics(serviceName) };
    }
    getAllMetrics() {
        const result = {};
        for (const [serviceName, metrics] of this.metrics) {
            result[serviceName] = { ...metrics };
        }
        return result;
    }
    reset(serviceName) {
        this.circuits.set(serviceName, {
            failures: 0,
            lastFailureTime: 0,
            nextAttemptTime: 0,
            state: circuit_breaker_interfaces_1.CircuitState.CLOSED
        });
        this.logger.log(`Circuit breaker reset for service: ${serviceName}`);
    }
    getOrCreateCircuit(serviceName) {
        if (!this.circuits.has(serviceName)) {
            this.registerCircuit(serviceName);
        }
        return this.circuits.get(serviceName);
    }
    getOrCreateConfig(serviceName) {
        if (!this.configs.has(serviceName)) {
            this.registerCircuit(serviceName);
        }
        return this.configs.get(serviceName);
    }
    getOrCreateMetrics(serviceName) {
        if (!this.metrics.has(serviceName)) {
            this.registerCircuit(serviceName);
        }
        return this.metrics.get(serviceName);
    }
    transitionToOpen(serviceName) {
        const config = this.getOrCreateConfig(serviceName);
        const circuit = this.getOrCreateCircuit(serviceName);
        const metrics = this.getOrCreateMetrics(serviceName);
        circuit.state = circuit_breaker_interfaces_1.CircuitState.OPEN;
        circuit.nextAttemptTime = Date.now() + config.retryAttemptTimeout;
        metrics.circuitOpenEvents++;
        this.circuits.set(serviceName, circuit);
        this.metrics.set(serviceName, metrics);
        this.logger.warn(`Circuit breaker OPENED for service: ${serviceName}. Next attempt at: ${new Date(circuit.nextAttemptTime).toISOString()}`);
    }
    transitionToHalfOpen(serviceName) {
        const circuit = this.getOrCreateCircuit(serviceName);
        const config = this.getOrCreateConfig(serviceName);
        const metrics = this.getOrCreateMetrics(serviceName);
        circuit.state = circuit_breaker_interfaces_1.CircuitState.HALF_OPEN;
        circuit.nextAttemptTime = Date.now() + config.halfOpenRetryTimeout;
        metrics.circuitHalfOpenEvents++;
        this.circuits.set(serviceName, circuit);
        this.metrics.set(serviceName, metrics);
        this.logger.log(`Circuit breaker transitioned to HALF_OPEN for service: ${serviceName}`);
    }
    transitionToClosed(serviceName) {
        const circuit = this.getOrCreateCircuit(serviceName);
        const metrics = this.getOrCreateMetrics(serviceName);
        const wasOpen = circuit.state !== circuit_breaker_interfaces_1.CircuitState.CLOSED;
        circuit.state = circuit_breaker_interfaces_1.CircuitState.CLOSED;
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
};
exports.CircuitBreakerService = CircuitBreakerService;
exports.CircuitBreakerService = CircuitBreakerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [common_1.Logger])
], CircuitBreakerService);
