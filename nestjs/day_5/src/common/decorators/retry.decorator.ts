import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { RetryInterceptor } from '@common/interceptors/retry.interceptor';
import { RetryOptions } from '@common/interfaces/retry-options.interface';

export function Retry(options: RetryOptions) {
    return applyDecorators(UseInterceptors(new RetryInterceptor(options.delay, options.attempts)));
}
