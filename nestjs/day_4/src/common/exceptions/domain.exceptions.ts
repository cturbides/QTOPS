import { HttpException, HttpStatus } from '@nestjs/common';

export abstract class DomainException extends HttpException {
    constructor(message: string, statusCode: HttpStatus) {
        super(message, statusCode);
    }
}

export class EntityNotFoundException extends DomainException {
    constructor(entityName: string, id: string) {
        super(`${entityName} con ID ${id} no encontrado`, HttpStatus.NOT_FOUND);
    }
}

export class BusinessRuleViolationException extends DomainException {
    constructor(rule: string, details?: string[]) {
        super(`Violación de regla de negocio: ${rule}`, HttpStatus.BAD_REQUEST);

        if (details) {
            const response = this.getResponse();

            if (typeof response === 'object' && response !== null) {
                (response as Record<string, unknown>)['details'] = details;
            }
        }
    }
}

export class InsufficientPermissionsException extends DomainException {
    constructor(action: string, resource: string) {
        super(`Permisos insuficientes para ${action} en ${resource}`, HttpStatus.FORBIDDEN);
    }
}
