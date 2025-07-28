import { AppDataSource } from '@data-source/index';
import { Product } from '@products/entities/product.entity';

async function seed() {
    await AppDataSource.initialize();

    const productRepo = AppDataSource.getRepository(Product);

    const products = [
        { name: 'Monitor 27 pulgadas', price: 249.99, stock: 10 },
        { name: 'Laptop Dell XPS 15', price: 1899.99, stock: 5 },
        { name: 'Teclado mecánico RGB', price: 89.5, stock: 20 },
    ];

    for (const p of products) {
        const existing = await productRepo.findOneBy({ name: p.name });

        if (!existing) {
            await productRepo.save(productRepo.create(p));
            console.log(`Added product: ${p.name}`);
        }
    }

    await AppDataSource.destroy();
}

seed().catch(console.error);
