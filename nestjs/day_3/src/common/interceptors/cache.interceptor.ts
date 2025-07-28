import { Observable, of, tap } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { CacheEntry } from '@common/interfaces/cache-entry.interface';
import { CallHandler, Injectable, NestInterceptor, ExecutionContext, } from '@nestjs/common';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
    private ttl: number;
    private cache = new Map<string, CacheEntry>();

    constructor(private readonly configService: ConfigService) {
        this.ttl = this.configService.get<number>('CACHE_TTL_MS') || 5 * 60 * 1000;
    }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const method = request.method;

        // Cache only GET requests
        if (method === 'GET') {
            const key = this.generateCacheKey(request);
            const cached = this.cache.get(key);

            if (cached && Date.now() - cached.timestamp < this.ttl) {
                // TODO: Delete debug
                console.log(`Cache hit: ${key}`);
                return of(cached.value);
            }

            // TODO: Delete debug
            console.log(`Cache miss: ${key}`);
            return next.handle().pipe(
                tap((data) => {
                    this.cache.set(key, { value: data, timestamp: Date.now() });
                }),
            );
        }

        // Invalidate cache on write operations
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            console.log('❌ Write operation – cache cleared');
            this.cache.clear();
        }

        return next.handle();
    }

    private generateCacheKey(request: any): string {
        const { url, params, query, user } = request;

        const userId = user?.id || 'anonymous'; 
        const serializedParams = JSON.stringify(params || {});
        const serializedQuery = JSON.stringify(query || {});

        return `GET:${url}:${serializedParams}:${serializedQuery}:USER:${userId}`;
    }
}
