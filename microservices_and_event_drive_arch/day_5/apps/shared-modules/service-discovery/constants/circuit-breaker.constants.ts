export const DEFAULT_CIRCUIT_BREAKER_CONFIG = {
  timeout: 10000,               // 10 segundos de timeout
  failureThreshold: 5,          // 5 fallas consecutivas antes de abrir
  retryAttemptTimeout: 60000,   // 1 minuto antes del próximo intento
  halfOpenRetryTimeout: 30000   // 30 segundos en estado half-open
};

export const CIRCUIT_BREAKER_METRICS_PREFIX = 'circuit_breaker_metrics';

export const CIRCUIT_BREAKER_STATE_PREFIX = 'circuit_breaker_state';
