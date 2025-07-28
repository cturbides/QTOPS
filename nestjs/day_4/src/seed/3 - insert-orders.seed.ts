import { User } from '@users/entities/user.entity';
import { AppDataSource } from '@data-source/index';
import { Order } from '@orders/entities/order.entity';
import { Product } from '@products/entities/product.entity';
import { OrderItem } from '@orders/entities/order-item.entity';
import { OrderStatus } from '@orders/constants/order-status.enum';

async function seed() {
    await AppDataSource.initialize();

    const userRepo = AppDataSource.getRepository(User);
    const orderRepo = AppDataSource.getRepository(Order);
    const productRepo = AppDataSource.getRepository(Product);
    const orderItemRepo = AppDataSource.getRepository(OrderItem);

    const user = await userRepo.findOneBy({ email: 'user1@example.com' });
    const admin = await userRepo.findOneBy({ email: 'admin@example.com' });

    const monitor = await productRepo.findOneBy({ name: 'Monitor 27 pulgadas' });
    const laptop = await productRepo.findOneBy({ name: 'Laptop Dell XPS 15' });
    const keyboard = await productRepo.findOneBy({ name: 'Teclado mecánico RGB' });

    if (!user || !admin || !monitor || !laptop || !keyboard) {
        throw new Error('No user or product found. Please ensure users and products are seeded first.');
    }

    const ordersData = [
        {
            user,
            items: [
                { product: monitor, quantity: 2 },
                { product: keyboard, quantity: 1 },
            ],
        },
        {
            user: admin,
            items: [
                { product: laptop, quantity: 1 },
            ],
        },
    ];

    for (const { user, items } of ordersData) {
        const existing = await orderRepo.findOne({
            where: { user: { id: user.id } },
            relations: ['items', 'items.product'],
        });

        if (!existing) {
            let totalPrice = 0;

            const order = orderRepo.create({
                user,
                status: OrderStatus.PENDING,
                totalPrice: 0,
            });

            const savedOrder = await orderRepo.save(order);

            for (const { product, quantity } of items) {
                totalPrice += Number(product.price) * quantity;

                const item = orderItemRepo.create({
                    order: savedOrder,
                    product,
                    quantity,
                    price: product.price,
                });

                await orderItemRepo.save(item);
            }

            savedOrder.totalPrice = totalPrice;
            await orderRepo.save(savedOrder);

            console.log(`Order added for user ${user.email}`);
        }
    }

    await AppDataSource.destroy();
}

seed().catch(console.error);
