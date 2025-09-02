import { Observable, tap } from "rxjs";
import { IMetric } from "@performance/interfaces/metric.interface";
import { DEFAULT_PERFORMANCE_SLOW_QUERY_DURATION } from "../constants/common";
import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from "@nestjs/common";

@Injectable()
export class DatabasePerformanceInterceptor implements NestInterceptor {
    private readonly logger = new Logger(DatabasePerformanceInterceptor.name);

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const startTime = Date.now();
        const request = context.switchToHttp().getRequest();
        const url: string = request.url;
        const method: string = request.method;

        return next.handle().pipe(
            tap(() => {
                const endTime = Date.now();
                const duration = endTime - startTime;

                if (duration > DEFAULT_PERFORMANCE_SLOW_QUERY_DURATION) { // Más de 1 segundo
                    this.logger.warn(`Query lenta detectada: ${method} ${url} - ${duration}ms`);
                }

                this.enviarMetricas({
                    endpoint: url,
                    metodo: method,
                    duracion: duration,
                    timestamp: new Date()
                });
            })
        );
    }

    private enviarMetricas(metrica: IMetric) {
        // TODO
        this.logger.log(`Métrica enviada: ${JSON.stringify(metrica)}`);
    }
}