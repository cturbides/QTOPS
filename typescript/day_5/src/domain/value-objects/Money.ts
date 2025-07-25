export class Money {
    constructor(public readonly amount: number, public readonly currency: string) {
        if (amount < 0) throw new Error('Amount cannot be negative');
    }
}
