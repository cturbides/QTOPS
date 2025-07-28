import request from 'supertest';
import { describe } from 'node:test';
import { INestApplication } from '@nestjs/common';
import { TestHelper } from '@test/utils/test.helper';
import { OrderStatus } from '@orders/constants/order-status.enum';

describe('Performance: Orders Module', () => {
    let app: INestApplication;
    let token: string;
    let productId: string;

    beforeAll(async () => {
        const moduleRef = await TestHelper.createTestingModule();
        app = moduleRef.createNestApplication();
        await app.init();

        token = await TestHelper.createAdminUser(app);

        const productRes = await request(app.getHttpServer())
            .post('/products')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Perf Product', price: 10.5, stock: 1000 });

        productId = productRes.body.data.id;
    });

    afterAll(async () => {
        if (app) {
            await app.close();
        }
    });

    it('debería crear 50 órdenes concurrentes en menos de 10s total', async () => {
        const payload = {
            items: [{ productId, quantity: 1 }]
        };

        const start = Date.now();

        const requests = Array.from({ length: 50 }).map(() =>
            TestHelper.retryRequest(() =>
                request(app.getHttpServer())
                    .post('/orders')
                    .set('Authorization', `Bearer ${token}`)
                    .send(payload)
            )
        );

        const responses = await Promise.allSettled(requests);
        const end = Date.now();
        const duration = (end - start) / 1000;

        responses.forEach(res => {
            if (res.status === 'fulfilled') {
                const response = res.value;
                expect(response.status).toBeLessThan(500);
                expect(response.body.data?.id).toBeDefined();
            } else {
                console.error('Falló una solicitud:', res.reason);
                fail('Una solicitud falló inesperadamente');
            }
        });

        console.log(`50 requests took ${duration.toFixed(2)}s total`);

        expect(duration).toBeLessThan(10);
    }, 10000); // Timeout for the test

    it('Debería obtener todas las órdenes del usuario rápidamente', async () => {
        const start = Date.now();

        const res = await request(app.getHttpServer())
            .get('/orders')
            .set('Authorization', `Bearer ${token}`);

        const end = Date.now();
        const duration = end - start;

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(duration).toBeLessThan(1000);

        console.log(`Obtener todas las ordenes tomó ${duration}ms`);
    });

    it('Debería cancelar una orden en menos de 1s', async () => {
        const createRes = await request(app.getHttpServer())
            .post('/orders')
            .set('Authorization', `Bearer ${token}`)
            .send({ items: [{ productId, quantity: 1 }] });

        const orderId = createRes.body.data.id;
        const start = Date.now();

        const res = await request(app.getHttpServer())
            .patch(`/orders/${orderId}/cancel`)
            .set('Authorization', `Bearer ${token}`);

        const end = Date.now();
        const duration = end - start;

        expect(res.status).toBe(200);
        expect(res.body.data.status).toBe('CANCELLED');
        expect(duration).toBeLessThan(1000);

        console.log(`Cancelar orden tomó ${duration}ms`);
    });

    it('Debería eliminar una orden en menos de 1s como admin', async () => {
        const createRes = await request(app.getHttpServer())
            .post('/orders')
            .set('Authorization', `Bearer ${token}`)
            .send({ items: [{ productId, quantity: 1 }] });

        const orderId = createRes.body.data.id;
        const start = Date.now();

        const res = await request(app.getHttpServer())
            .delete(`/orders/${orderId}`)
            .set('Authorization', `Bearer ${token}`);

        const end = Date.now();
        const duration = end - start;

        expect(res.status).toBe(200);
        expect(res.body.data.message).toContain('deleted');
        expect(duration).toBeLessThan(1000);

        console.log(`Eliminar orden tomó ${duration}ms`);
    });

    it('Debería obtener una orden por ID en menos de 1s', async () => {
        const createRes = await request(app.getHttpServer())
            .post('/orders')
            .set('Authorization', `Bearer ${token}`)
            .send({ items: [{ productId, quantity: 1 }] });

        const orderId = createRes.body.data.id;

        const start = Date.now();

        const res = await request(app.getHttpServer())
            .get(`/orders/${orderId}`)
            .set('Authorization', `Bearer ${token}`);

        const end = Date.now();
        const duration = end - start;

        expect(res.status).toBe(200);
        expect(res.body.data.id).toBe(orderId);
        expect(duration).toBeLessThan(1000);

        console.log(`Conseguir una orden por id tomó ${duration}ms`);
    });

    it('Debería actualizar el estado de una orden como admin en menos de 1s', async () => {
        const createRes = await request(app.getHttpServer())
            .post('/orders')
            .set('Authorization', `Bearer ${token}`)
            .send({ items: [{ productId, quantity: 1 }] });

        const orderId = createRes.body.data.id;

        const start = Date.now();

        const res = await request(app.getHttpServer())
            .patch(`/orders/${orderId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ status: OrderStatus.CANCELLED });

        const end = Date.now();
        const duration = end - start;

        expect(res.status).toBe(200);
        expect(res.body.data.status).toBe('CANCELLED');
        expect(duration).toBeLessThan(1000);

        console.log(`Actualizar una orden tomó ${duration}ms`);
    });

    it('Debería cancelar una orden en menos de 1s', async () => {
        const createRes = await request(app.getHttpServer())
            .post('/orders')
            .set('Authorization', `Bearer ${token}`)
            .send({ items: [{ productId, quantity: 1 }] });

        const orderId = createRes.body.data.id;
        const start = Date.now();

        const res = await request(app.getHttpServer())
            .patch(`/orders/${orderId}/cancel`)
            .set('Authorization', `Bearer ${token}`);

        const end = Date.now();
        const duration = end - start;

        expect(res.status).toBe(200);
        expect(res.body.data.status).toBe(OrderStatus.CANCELLED);
        expect(duration).toBeLessThan(1000);

        console.log(`Cancelar una orden tomó ${duration}ms`);
    });
});
