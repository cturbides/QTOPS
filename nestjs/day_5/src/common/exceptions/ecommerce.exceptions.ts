import { EntityNotFoundException, BusinessRuleViolationException } from '@common/exceptions/domain.exceptions';

export class ProductNotFoundException extends EntityNotFoundException {
    constructor(productId: string) {
        super('Producto', productId);
    }
}

export class InsufficientStockException extends BusinessRuleViolationException {
    constructor(productName: string, requested: number, available: number) {
        super(`Stock insuficiente para ${productName}`, [
            `Solicitado: ${requested}`,
            `Disponible: ${available}`
        ]);
    }
}

export class InvalidOrderStateException extends BusinessRuleViolationException {
    constructor(currentState: string, attemptedAction: string) {
        super(
            `No se puede ${attemptedAction} un pedido en estado ${currentState}`,
            [`Estado actual: ${currentState}`, `Acción intentada: ${attemptedAction}`]
        );
    }
}
