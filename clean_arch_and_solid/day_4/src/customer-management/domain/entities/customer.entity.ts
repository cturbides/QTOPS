export class Customer {
    constructor(
        private readonly id: string,
        private readonly name: string,
        private readonly isPremiumCustomer: boolean
    ) { }

    getId(): string {
        return this.id;
    }

    getName(): string {
        return this.name;
    }

    isPremium(): boolean {
        return this.isPremiumCustomer;
    }
}
