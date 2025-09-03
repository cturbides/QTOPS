import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ChaosService } from './chaos.service';

@Injectable()
export class ChaosInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ChaosInterceptor.name);

  constructor(private readonly chaosService: ChaosService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const path = request.url;

    // No aplicar chaos a endpoints de chaos (evitar recursión)
    if (path.includes('/chaos')) {
      return next.handle();
    }

    // No aplicar chaos a health checks críticos
    if (path.includes('/health') && !path.includes('/chaos/health')) {
      return next.handle();
    }

    // 1. Verificar si debe introducir error antes de ejecutar
    const errorResult = this.chaosService.shouldIntroduceError();
    if (errorResult.shouldError) {
      this.logger.error(`🐒 CHAOS: Blocking request to ${path} with error ${errorResult.error.statusCode}`);
      throw new HttpException(
        errorResult.error.message,
        errorResult.error.statusCode
      );
    }

    // 2. Introducir latencia antes de la ejecución
    await this.chaosService.introduceLatency();

    // 3. Simular fuga de memoria ocasionalmente
    this.chaosService.simulateMemoryLeak();

    // 4. Continuar con la ejecución normal
    return next.handle().pipe(
      tap(() => {
        // Log successful requests con chaos aplicado
        const config = this.chaosService.getConfig();
        if (config.enabled) {
          this.logger.debug(`🐒 CHAOS: Request to ${path} completed successfully despite chaos`);
        }
      }),
      catchError((error) => {
        // Si hay un error real, añadir contexto de chaos
        if (this.chaosService.getConfig().enabled) {
          this.logger.warn(`🐒 CHAOS: Request to ${path} failed (may be due to chaos): ${error.message}`);
        }
        return throwError(() => error);
      })
    );
  }
}
