"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitTimeoutException = exports.CircuitOpenException = exports.CircuitBreakerException = void 0;
class CircuitBreakerException extends Error {
    constructor(message, serviceName, circuitState) {
        super(message);
        this.serviceName = serviceName;
        this.circuitState = circuitState;
        this.name = 'CircuitBreakerException';
    }
}
exports.CircuitBreakerException = CircuitBreakerException;
class CircuitOpenException extends CircuitBreakerException {
    constructor(serviceName, nextAttemptTime) {
        super(`Circuit breaker is OPEN for service '${serviceName}'. Next attempt allowed at ${new Date(nextAttemptTime).toISOString()}`, serviceName, 'OPEN');
        this.name = 'CircuitOpenException';
    }
}
exports.CircuitOpenException = CircuitOpenException;
class CircuitTimeoutException extends CircuitBreakerException {
    constructor(serviceName, timeout) {
        super(`Request to service '${serviceName}' timed out after ${timeout}ms`, serviceName, 'TIMEOUT');
        this.name = 'CircuitTimeoutException';
    }
}
exports.CircuitTimeoutException = CircuitTimeoutException;
