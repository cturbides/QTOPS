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
exports.CircuitBreakerWrapper = void 0;
const common_1 = require("@nestjs/common");
const circuit_breaker_service_1 = require("./circuit-breaker.service");
const circuit_breaker_exception_1 = require("../exceptions/circuit-breaker.exception");
let CircuitBreakerWrapper = class CircuitBreakerWrapper {
    constructor(logger, circuitBreaker) {
        this.logger = logger;
        this.circuitBreaker = circuitBreaker;
    }
    async execute(serviceName, operation, config) {
        // Registrar el circuit breaker si no existe
        if (!this.circuitBreaker.getCircuitState(serviceName)) {
            this.circuitBreaker.registerCircuit(serviceName, config);
        }
        try {
            this.circuitBreaker.canExecute(serviceName);
        }
        catch (error) {
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
        }
        catch (error) {
            this.circuitBreaker.recordFailure(serviceName, error);
            if (error instanceof Error && error.name === 'TimeoutError') {
                throw new circuit_breaker_exception_1.CircuitTimeoutException(serviceName, config?.timeout || 10000);
            }
            throw error;
        }
    }
    async executeWithTimeout(operation, timeoutMs) {
        return Promise.race([
            operation(),
            new Promise((_, reject) => {
                setTimeout(() => {
                    const error = new Error(`Operation timed out after ${timeoutMs}ms`);
                    error.name = 'TimeoutError';
                    reject(error);
                }, timeoutMs);
            })
        ]);
    }
    getCircuitState(serviceName) {
        return this.circuitBreaker.getCircuitState(serviceName);
    }
    getMetrics(serviceName) {
        return this.circuitBreaker.getMetrics(serviceName);
    }
    getAllMetrics() {
        return this.circuitBreaker.getAllMetrics();
    }
    reset(serviceName) {
        this.circuitBreaker.reset(serviceName);
        this.logger.log(`Circuit breaker manually reset for service: ${serviceName}`);
    }
};
exports.CircuitBreakerWrapper = CircuitBreakerWrapper;
exports.CircuitBreakerWrapper = CircuitBreakerWrapper = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [common_1.Logger, circuit_breaker_service_1.CircuitBreakerService])
], CircuitBreakerWrapper);
