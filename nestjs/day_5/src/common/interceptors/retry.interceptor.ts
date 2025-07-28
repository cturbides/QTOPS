import { Observable, retry, timer } from 'rxjs';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor, } from '@nestjs/common';

@Injectable()
export class RetryInterceptor implements NestInterceptor {
    constructor(
        private readonly delayMs: number = 500,
        private readonly maxAttempts: number = 3,
    ) { }

    intercept(_: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            retry({
                count: this.maxAttempts,
                delay: (_error, retryCount) => {
                    const delayTime = Math.pow(2, retryCount - 1) * this.delayMs;
                    return timer(delayTime);
                },
            })
        );
    }
}