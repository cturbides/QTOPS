export class ProductId {
    constructor(private readonly value: string) {
        if (!value) throw new Error('ProductId no puede estar vacío');
    }

    getValue(): string {
        return this.value;
    }
}
