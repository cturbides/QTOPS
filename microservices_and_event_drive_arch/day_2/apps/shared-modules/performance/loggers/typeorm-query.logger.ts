import { Logger, QueryRunner } from 'typeorm';

export class TypeOrmQueryLogger implements Logger {
    private queries: string[] = [];

    logQuery(query: string, parameters?: any[], _queryRunner?: QueryRunner): void {
        this.queries.push(query);
        console.log('Query ejecutada:', query, parameters);

        const nPlusOnePattern = /SELECT .* FROM .* WHERE .* IN \(/;

        if (nPlusOnePattern.test(query)) {
            console.warn('Posible problema de N+1 detectado:', query);
            console.info('Sugerencia: Usa eager loading con `leftJoinAndSelect` para optimizar.');
        }
    }

    logQueryError(error: string, query: string, parameters?: any[], _queryRunner?: QueryRunner): void {
        console.error('Error en query:', query, parameters, error);
    }

    logQuerySlow(time: number, query: string, parameters?: any[], _queryRunner?: QueryRunner): void {
        console.warn(`Query lenta (${time}ms):`, query, parameters);
    }

    logSchemaBuild(message: string, _queryRunner?: QueryRunner): void {
        console.log('Schema build:', message);
    }

    logMigration(message: string, _queryRunner?: QueryRunner): void {
        console.log('Migración:', message);
    }

    log(level: 'log' | 'info' | 'warn', message: any, _queryRunner?: QueryRunner): void {
        if (level === 'warn') {
            console.warn('Advertencia:', message);
        } else {
            console.log('Log:', message);
        }
    }

    getCapturedQueries(): string[] {
        return this.queries;
    }
}
