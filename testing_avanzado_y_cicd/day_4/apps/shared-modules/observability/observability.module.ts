import { Module, Global } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DistributedLogger } from './distributed-logger.service';
import { TracingService } from './tracing.service';
import { PrometheusMetricsService } from './prometheus-metrics.service';
import { ELearningObservabilityService } from './elearning-observability.service';
import { CorrelationMiddleware } from './correlation.middleware';
import { MetricsInterceptor } from './metrics.interceptor';
import { AnomalyDetectionService } from './anomaly-detection.service';
import { AlertNotificationService } from './alert-notification.service';
import { EnrollmentAlertingService } from './enrollment-alerting.service';
import { AlertingController } from './alerting.controller';

@Global()
@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [
    DistributedLogger,
    TracingService,
    PrometheusMetricsService,
    ELearningObservabilityService,
    CorrelationMiddleware,
    MetricsInterceptor,
    AnomalyDetectionService,
    AlertNotificationService,
    EnrollmentAlertingService,
  ],
  controllers: [AlertingController],
  exports: [
    DistributedLogger,
    TracingService,
    PrometheusMetricsService,
    ELearningObservabilityService,
    CorrelationMiddleware,
    MetricsInterceptor,
    AnomalyDetectionService,
    AlertNotificationService,
    EnrollmentAlertingService,
  ],
})
export class ObservabilityModule {}
