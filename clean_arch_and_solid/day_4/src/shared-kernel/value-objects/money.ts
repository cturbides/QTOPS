export class Money {
    constructor(private readonly amount: number, private readonly currency: string) {
        if (amount < 0) throw new Error('El monto no puede ser negativo');
    }

    add(other: Money): Money {
        if (this.currency !== other.currency) {
            throw new Error('No se pueden sumar monedas de diferentes divisas');
        }
        return new Money(this.amount + other.amount, this.currency);
    }

    isLessThanOrEqual(other: Money): boolean {
        return this.amount <= other.amount;
    }


    multiply(factor: number): Money {
        return new Money(this.amount * factor, this.currency);
    }

    getValue(): number {
        return this.amount;
    }

    getCurrency(): string {
        return this.currency;
    }

    static zero(): Money {
        return new Money(0, 'USD');
    }
}