export class CircuitBreakerException extends Error {
  constructor(
    message: string, 
    public readonly serviceName: string,
    public readonly circuitState: string
  ) {
    super(message);
    this.name = 'CircuitBreakerException';
  }
}

export class CircuitOpenException extends CircuitBreakerException {
  constructor(serviceName: string, nextAttemptTime: number) {
    super(
      `Circuit breaker is OPEN for service '${serviceName}'. Next attempt allowed at ${new Date(nextAttemptTime).toISOString()}`,
      serviceName,
      'OPEN'
    );
    this.name = 'CircuitOpenException';
  }
}

export class CircuitTimeoutException extends CircuitBreakerException {
  constructor(serviceName: string, timeout: number) {
    super(
      `Request to service '${serviceName}' timed out after ${timeout}ms`,
      serviceName,
      'TIMEOUT'
    );
    this.name = 'CircuitTimeoutException';
  }
}
