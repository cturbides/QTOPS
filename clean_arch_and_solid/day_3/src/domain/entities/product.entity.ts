export class Product {
    constructor(
        private readonly id: string,
        private name: string,
        private price: number,
        private stock: number
    ) {
        this.validatePrice(price);
        this.validateStock(stock);
    }

    private validatePrice(price: number): void {
        if (price <= 0) throw new Error('El precio debe ser mayor a cero');
    }

    private validateStock(stock: number): void {
        if (stock < 0) throw new Error('El stock no puede ser negativo');
    }

    updatePrice(newPrice: number): void {
        this.validatePrice(newPrice);
        this.price = newPrice;
    }

    reduceStock(quantity: number): void {
        if (quantity > this.stock) {
            throw new Error('Stock insuficiente');
        }
        this.stock -= quantity;
    }

    setName(name: string): void {
        if (!name || name.trim() === '') {
            throw new Error('El nombre del producto no puede estar vacío');
        }

        this.name = name;
    }

    getId(): string {
        return this.id;
    }

    getName(): string {
        return this.name;
    }

    getPrice(): number {
        return this.price;
    }

    getStock(): number {
        return this.stock;
    }

}