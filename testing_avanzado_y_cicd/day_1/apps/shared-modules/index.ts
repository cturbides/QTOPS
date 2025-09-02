// Health Module  
export { HealthModule } from './health/health.module';

// Performance Module
export { PerformanceModule } from './performance/performance.module';

// Service Discovery Module
export { ServiceDiscoveryModule } from './service-discovery/service-discovery.module';

// Versioning Module
export * from './versioning';

// Observability exports
export { ObservabilityModule } from './observability/observability.module';
export { DistributedLogger } from './observability/distributed-logger.service';
export { PrometheusMetricsService } from './observability/prometheus-metrics.service';
export { TracingService } from './observability/tracing.service';
export { ELearningObservabilityService } from './observability/elearning-observability.service';
export { CorrelationMiddleware } from './observability/correlation.middleware';
export { MetricsInterceptor } from './observability/metrics.interceptor';
export { AnomalyDetectionService, EnrollmentAnomaly } from './observability/anomaly-detection.service';
export { AlertNotificationService, AlertNotification } from './observability/alert-notification.service';
export { EnrollmentAlertingService } from './observability/enrollment-alerting.service';

