import { Module, Global } from '@nestjs/common';
import { DistributedLogger } from './distributed-logger.service';
import { TracingService } from './tracing.service';
import { PrometheusMetricsService } from './prometheus-metrics.service';
import { ELearningObservabilityService } from './elearning-observability.service';
import { CorrelationMiddleware } from './correlation.middleware';
import { MetricsInterceptor } from './metrics.interceptor';

@Global()
@Module({
  providers: [
    DistributedLogger,
    TracingService,
    PrometheusMetricsService,
    ELearningObservabilityService,
    CorrelationMiddleware,
    MetricsInterceptor,
  ],
  exports: [
    DistributedLogger,
    TracingService,
    PrometheusMetricsService,
    ELearningObservabilityService,
    CorrelationMiddleware,
    MetricsInterceptor,
  ],
})
export class ObservabilityModule {}
