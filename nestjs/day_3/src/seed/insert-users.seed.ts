import { hash } from 'bcrypt';
import { User } from '@users/entities/user.entity';
import { AppDataSource } from '@data-source/index';
import { Role } from '@common/constants/roles.enum';

async function seed() {
    await AppDataSource.initialize();

    const userRepo = AppDataSource.getRepository(User);

    const users = [
        {
            email: 'admin@example.com',
            name: 'Admin',
            password: await hash('admin123', 10),
            roles: [Role.ADMIN],
            isActive: true,
        },
        {
            email: 'user1@example.com',
            name: 'User One',
            password: await hash('user1234', 10),
            roles: [Role.USER],
            isActive: true,
        },
        {
            email: 'multi@example.com',
            name: 'Power User',
            password: await hash('multi1234', 10),
            roles: [Role.USER, Role.ADMIN],
            isActive: true,
        },
    ];

    for (const u of users) {
        const existing = await userRepo.findOneBy({ email: u.email });

        if (!existing) {
            await userRepo.save(userRepo.create(u));
            console.log(`Added user with email: ${u.email}`);
        }
    }

    await AppDataSource.destroy();
}

seed().catch(console.error);
