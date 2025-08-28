"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeOrmQueryLogger = void 0;
class TypeOrmQueryLogger {
    constructor() {
        this.queries = [];
    }
    logQuery(query, parameters, _queryRunner) {
        this.queries.push(query);
        console.log('Query ejecutada:', query, parameters);
        const nPlusOnePattern = /SELECT .* FROM .* WHERE .* IN \(/;
        if (nPlusOnePattern.test(query)) {
            console.warn('Posible problema de N+1 detectado:', query);
            console.info('Sugerencia: Usa eager loading con `leftJoinAndSelect` para optimizar.');
        }
    }
    logQueryError(error, query, parameters, _queryRunner) {
        console.error('Error en query:', query, parameters, error);
    }
    logQuerySlow(time, query, parameters, _queryRunner) {
        console.warn(`Query lenta (${time}ms):`, query, parameters);
    }
    logSchemaBuild(message, _queryRunner) {
        console.log('Schema build:', message);
    }
    logMigration(message, _queryRunner) {
        console.log('Migración:', message);
    }
    log(level, message, _queryRunner) {
        if (level === 'warn') {
            console.warn('Advertencia:', message);
        }
        else {
            console.log('Log:', message);
        }
    }
    getCapturedQueries() {
        return this.queries;
    }
}
exports.TypeOrmQueryLogger = TypeOrmQueryLogger;
