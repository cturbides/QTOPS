import { map, Observable } from 'rxjs';
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';

@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map(data => ({
                success: true,
                data: data,
                timestamp: new Date().toISOString(),
            }))
        );
    }
}
