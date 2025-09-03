import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrometheusMetricsService } from './prometheus-metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metrics: PrometheusMetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const method = request.method;
    const route = request.route?.path || request.url;

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          this.metrics.recordHttpRequest(
            method,
            route,
            response.statusCode,
            duration
          );
        },
        error: () => {
          const duration = Date.now() - startTime;
          this.metrics.recordHttpRequest(
            method,
            route,
            response.statusCode || 500,
            duration
          );
        }
      })
    );
  }
}
