import { hash } from 'bcrypt';
import request from 'supertest';
import { Repository } from 'typeorm';
import { INestApplication } from '@nestjs/common';
import { Role } from '@common/constants/roles.enum';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';

import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@auth/auth.module';
import { UsersModule } from '@users/users.module';
import { User } from '@users/entities/user.entity';
import { CommonModule } from '@common/common.module';
import { OrdersModule } from '@orders/orders.module';
import { Order } from '@orders/entities/order.entity';
import { ProductsModule } from '@products/products.module';
import { Product } from '@products/entities/product.entity';
import { OrderItem } from '@orders/entities/order-item.entity';

export class TestHelper {
    static async createTestingModule(imports: any[] = []): Promise<TestingModule> {
        return Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({ isGlobal: true }),
                TypeOrmModule.forRoot({
                    type: 'sqlite',
                    database: ':memory:',
                    dropSchema: true,
                    entities: [User, Product, Order, OrderItem],
                    synchronize: true,
                }),
                UsersModule,
                ProductsModule,
                OrdersModule,
                AuthModule,
                CommonModule,
                ...imports,
            ],
        }).compile();
    }

    static async createAuthenticatedUser(app: INestApplication): Promise<string> {
        const email = `test-${Date.now()}@example.com`;

        await request(app.getHttpServer())
            .post('/users')
            .send({
                email: email,
                name: 'Test User',
                password: 'SecurePass123!',
            });

        const loginResponse = await request(app.getHttpServer())
            .post('/users/login')
            .send({ email, password: 'SecurePass123!' });

        return loginResponse.body.accessToken;
    }

    static async createAdminUser(app: INestApplication): Promise<string> {
        const userRepo = app.get<Repository<User>>(getRepositoryToken(User));

        const password = 'Admin123!';
        const email = `admin-${Date.now()}@test.com`;

        const admin = userRepo.create({
            email,
            isActive: true,
            name: 'Test Admin',
            roles: [Role.ADMIN],
            createdAt: new Date(),
            password: await hash(password, 10),
        });

        await userRepo.save(admin);

        const loginRes = await request(app.getHttpServer())
            .post('/users/login')
            .send({ email, password });

        return loginRes.body.accessToken;
    }

    static async retryRequest(fn: Function, retries = 3, delay = 100) {
        for (let i = 0; i < retries; i++) {
            try {
                return await fn();
            } catch (err) {
                if (i === retries - 1) throw err;
                await new Promise(res => setTimeout(res, delay * (i + 1)));
            }
        }
    }

}
