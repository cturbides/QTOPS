export interface CircuitBreakerConfig {
  timeout: number;                // Tiempo en ms para considerar un timeout
  failureThreshold: number;       // Número de fallas consecutivas antes de abrir el circuito
  retryAttemptTimeout: number;    // Tiempo en ms antes del próximo intento cuando está abierto
  halfOpenRetryTimeout: number;   // Tiempo en ms para intentos en estado half-open
}

export interface CircuitBreakerState {
  failures: number;               // Número de fallas consecutivas actuales
  state: CircuitState;            // Estado actual del circuit breaker
  lastFailureTime: number;        // Timestamp de la última falla
  nextAttemptTime: number;        // Timestamp del próximo intento permitido
}

export enum CircuitState {
  OPEN = 'OPEN',          // Circuito abierto - bloquea todas las llamadas
  CLOSED = 'CLOSED',      // Circuito cerrado - permite todas las llamadas
  HALF_OPEN = 'HALF_OPEN' // Circuito semi-abierto - permite intentos limitados
}

export interface CircuitBreakerMetrics {
  totalRequests: number;
  failedRequests: number;
  circuitOpenEvents: number;
  successfulRequests: number;
  circuitCloseEvents: number;
  circuitHalfOpenEvents: number;
}
