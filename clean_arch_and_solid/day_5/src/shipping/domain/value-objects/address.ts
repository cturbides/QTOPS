export class Address {
    constructor(
        private readonly street: string,
        private readonly city: string,
        private readonly country: string,
        private readonly zipCode: string
    ) {
        if (!street || !city || !country || !zipCode) {
            throw new Error('Todos los campos en una dirección son obligatorios');
        }
    }

    toString(): string {
        return `${this.street}, ${this.city}, ${this.country} - ${this.zipCode}`;
    }
}
