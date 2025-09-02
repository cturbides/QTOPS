import { Injectable } from '@nestjs/common';
import { DistributedLogger } from './distributed-logger.service';
import { TracingService } from './tracing.service';
import { PrometheusMetricsService } from './prometheus-metrics.service';

export interface EnrollmentData {
  userId: string;
  courseId: string;
  enrollmentType: string;
  requiresPayment?: boolean;
  paymentMethod?: string;
  metadata?: Record<string, any>;
}

export interface EnrollmentResult {
  success: boolean;
  enrollmentId?: string;
  error?: string;
  duration?: number;
  compensationsExecuted?: string[];
}

@Injectable()
export class ELearningObservabilityService {
  constructor(
    private readonly logger: DistributedLogger,
    private readonly tracer: TracingService,
    private readonly metrics: PrometheusMetricsService
  ) {}

  async monitorearInscripcion(
    enrollmentData: EnrollmentData,
    correlationId: string,
    procesarInscripcion: (data: EnrollmentData) => Promise<EnrollmentResult>
  ): Promise<EnrollmentResult> {
    return await this.tracer.traceOperation(
      'course-enrollment',
      async (traceId: string, spanId: string) => {
        const startTime = Date.now();
        
        try {
          this.logger.logWithTrace(
            'info',
            'Iniciando proceso de inscripción',
            correlationId,
            traceId,
            spanId,
            { 
              courseId: enrollmentData.courseId, 
              userId: enrollmentData.userId,
              enrollmentType: enrollmentData.enrollmentType
            }
          );

          // Set span attributes
          this.tracer.setSpanTag(spanId, 'course.id', enrollmentData.courseId);
          this.tracer.setSpanTag(spanId, 'user.id', enrollmentData.userId);
          this.tracer.setSpanTag(spanId, 'enrollment.type', enrollmentData.enrollmentType);

          const result = await procesarInscripcion(enrollmentData);
          
          const duration = Date.now() - startTime;
          result.duration = duration;

          if (result.success) {
            this.metrics.recordEnrollmentOperation('enrollment', 'success', duration);
            
            this.logger.logWithTrace(
              'info',
              'Inscripción completada exitosamente',
              correlationId,
              traceId,
              spanId,
              { 
                enrollmentId: result.enrollmentId, 
                duration,
                courseId: enrollmentData.courseId,
                userId: enrollmentData.userId
              }
            );

            this.tracer.setSpanTag(spanId, 'enrollment.id', result.enrollmentId || 'unknown');
            this.tracer.logToSpan(spanId, `Enrollment completed successfully in ${duration}ms`);
          } else {
            this.metrics.recordEnrollmentOperation('enrollment', 'error', duration);
            
            this.logger.logWithTrace(
              'error',
              'Error en proceso de inscripción',
              correlationId,
              traceId,
              spanId,
              { 
                error: result.error, 
                duration,
                courseId: enrollmentData.courseId,
                userId: enrollmentData.userId,
                compensationsExecuted: result.compensationsExecuted
              }
            );

            this.tracer.setSpanTag(spanId, 'error.message', result.error || 'unknown');
            this.tracer.logToSpan(spanId, `Enrollment failed: ${result.error}`, 'error');
          }

          return result;
          
        } catch (error) {
          const duration = Date.now() - startTime;
          this.metrics.recordEnrollmentOperation('enrollment', 'error', duration);
          
          this.logger.logWithTrace(
            'error',
            'Excepción en proceso de inscripción',
            correlationId,
            traceId,
            spanId,
            { 
              error: error.message, 
              stack: error.stack,
              duration,
              courseId: enrollmentData.courseId,
              userId: enrollmentData.userId
            }
          );
          
          throw error;
        }
      },
      {
        'operation.type': 'enrollment',
        'course.id': enrollmentData.courseId,
        'user.id': enrollmentData.userId
      }
    );
  }

  // Monitor saga steps
  monitorSagaStep(
    sagaId: string,
    stepName: string,
    status: 'success' | 'error' | 'compensated',
    correlationId: string,
    metadata?: Record<string, any>
  ): void {
    this.metrics.recordSagaStep('enrollment', stepName, status);
    
    this.logger.logWithCorrelation(
      status === 'error' ? 'error' : 'info',
      `Saga step ${stepName} ${status}`,
      correlationId,
      {
        sagaId,
        stepName,
        status,
        ...metadata
      }
    );
  }

  // Monitor circuit breaker state changes
  monitorCircuitBreakerState(
    targetService: string,
    state: 'closed' | 'open' | 'half-open',
    correlationId?: string
  ): void {
    this.metrics.updateCircuitBreakerState(targetService, state);
    
    this.logger.logWithCorrelation(
      state === 'open' ? 'warn' : 'info',
      `Circuit breaker state changed to ${state} for service ${targetService}`,
      correlationId || 'system',
      { targetService, state }
    );
  }
}
