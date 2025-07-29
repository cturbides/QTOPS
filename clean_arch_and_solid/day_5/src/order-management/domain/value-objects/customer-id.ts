export class CustomerId {
    constructor(private readonly value: string) {
        if (!value) throw new Error('CustomerId no puede estar vacío');
    }

    getValue(): string {
        return this.value;
    }
}
