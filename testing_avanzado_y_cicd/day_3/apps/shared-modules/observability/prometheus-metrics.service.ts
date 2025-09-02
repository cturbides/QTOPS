import { Injectable } from '@nestjs/common';
import { register, Counter, Histogram, Gauge } from 'prom-client';

export interface HealthCheckResult {
  status: 'ok' | 'error';
  checks: {
    database?: boolean;
    redis?: boolean;
    rabbitmq?: boolean;
  };
}

@Injectable()
export class PrometheusMetricsService {
  private readonly httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code', 'service'],
    buckets: [0.1, 0.3, 0.5, 1, 2, 5, 10]
  });

  private readonly enrollmentOperationCounter = new Counter({
    name: 'enrollment_operations_total',
    help: 'Total number of enrollment operations',
    labelNames: ['operation_type', 'status', 'service', 'step']
  });

  private readonly enrollmentDuration = new Histogram({
    name: 'enrollment_duration_seconds',
    help: 'Duration of enrollment operations in seconds',
    labelNames: ['operation_type', 'status', 'service'],
    buckets: [0.5, 1, 2, 5, 10, 30, 60]
  });

  private readonly activeConnectionsGauge = new Gauge({
    name: 'active_connections',
    help: 'Number of active connections',
    labelNames: ['service', 'connection_type']
  });

  private readonly sagaStepCounter = new Counter({
    name: 'saga_steps_total',
    help: 'Total number of saga steps executed',
    labelNames: ['saga_type', 'step', 'status', 'service']
  });

  private readonly circuitBreakerGauge = new Gauge({
    name: 'circuit_breaker_state',
    help: 'Circuit breaker state (0=closed, 1=open, 2=half-open)',
    labelNames: ['service', 'target_service']
  });

  constructor() {
    // Register all metrics
    register.registerMetric(this.httpRequestDuration);
    register.registerMetric(this.enrollmentOperationCounter);
    register.registerMetric(this.enrollmentDuration);
    register.registerMetric(this.activeConnectionsGauge);
    register.registerMetric(this.sagaStepCounter);
    register.registerMetric(this.circuitBreakerGauge);
  }

  // Record HTTP request metrics
  recordHttpRequest(
    method: string,
    route: string,
    statusCode: number,
    duration: number
  ): void {
    this.httpRequestDuration
      .labels(method, route, statusCode.toString(), process.env.SERVICE_NAME || 'unknown')
      .observe(duration / 1000);
  }

  // Record enrollment operation metrics
  recordEnrollmentOperation(
    operationType: string,
    status: 'success' | 'error' | 'timeout',
    duration?: number,
    step?: string
  ): void {
    this.enrollmentOperationCounter
      .labels(operationType, status, process.env.SERVICE_NAME || 'unknown', step || 'unknown')
      .inc();

    if (duration !== undefined) {
      this.enrollmentDuration
        .labels(operationType, status, process.env.SERVICE_NAME || 'unknown')
        .observe(duration / 1000);
    }
  }

  // Record saga step metrics
  recordSagaStep(
    sagaType: string,
    step: string,
    status: 'success' | 'error' | 'compensated'
  ): void {
    this.sagaStepCounter
      .labels(sagaType, step, status, process.env.SERVICE_NAME || 'unknown')
      .inc();
  }

  // Update health metrics
  updateHealthMetrics(healthStatus: HealthCheckResult): void {
    const serviceName = process.env.SERVICE_NAME || 'unknown';
    
    if (healthStatus.checks.database !== undefined) {
      this.activeConnectionsGauge
        .labels(serviceName, 'database')
        .set(healthStatus.checks.database ? 1 : 0);
    }

    if (healthStatus.checks.redis !== undefined) {
      this.activeConnectionsGauge
        .labels(serviceName, 'redis')
        .set(healthStatus.checks.redis ? 1 : 0);
    }

    if (healthStatus.checks.rabbitmq !== undefined) {
      this.activeConnectionsGauge
        .labels(serviceName, 'rabbitmq')
        .set(healthStatus.checks.rabbitmq ? 1 : 0);
    }
  }

  // Update circuit breaker state
  updateCircuitBreakerState(
    targetService: string,
    state: 'closed' | 'open' | 'half-open'
  ): void {
    const stateValue = state === 'closed' ? 0 : state === 'open' ? 1 : 2;
    this.circuitBreakerGauge
      .labels(process.env.SERVICE_NAME || 'unknown', targetService)
      .set(stateValue);
  }

  // Get metrics endpoint data
  async getMetrics(): Promise<string> {
    return register.metrics();
  }

  // Reset all metrics (useful for testing)
  reset(): void {
    register.clear();
  }
}
