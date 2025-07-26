export class ShippingMethod {
    constructor(
        private readonly name: string,
        private readonly estimatedDays: number
    ) {
        if (!name || name.trim() === '') {
            throw new Error('El nombre del método de envío no puede estar vacío');
        }

        if (!estimatedDays || estimatedDays <= 0) {
            throw new Error('El tiempo estimado debe ser positivo');
        }
    }

    getName(): string {
        return this.name;
    }

    getEstimatedDays(): number {
        return this.estimatedDays;
    }
}
