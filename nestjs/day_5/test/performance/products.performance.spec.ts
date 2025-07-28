import request from 'supertest';
import { fail } from 'node:assert';
import { describe } from 'node:test';
import { INestApplication } from '@nestjs/common';
import { TestHelper } from '@test/utils/test.helper';

describe('Performance: Products Module', () => {
    let app: INestApplication;
    let adminToken: string;

    beforeAll(async () => {
        const moduleRef = await TestHelper.createTestingModule();
        app = moduleRef.createNestApplication();
        await app.init();

        adminToken = await TestHelper.createAdminUser(app);
    });

    afterAll(async () => {
        await app.close();
    });

    it('Debería crear 100 productos concurrentes en menos de 10s (con batches)', async () => {
        const payload = {
            name: 'PerfProduct',
            price: 10.5,
            stock: 1000,
        };

        const BATCH_SIZE = 10;
        const TOTAL = 100;
        const batches = Math.ceil(TOTAL / BATCH_SIZE);

        const start = Date.now();

        for (let batch = 0; batch < batches; batch++) {
            const batchStart = batch * BATCH_SIZE;
            const promises = Array.from({ length: BATCH_SIZE }).map((_, i) =>
                TestHelper.retryRequest(() =>
                    request(app.getHttpServer())
                        .post('/products')
                        .set('Authorization', `Bearer ${adminToken}`)
                        .send({ ...payload, name: `PerfProduct-${batchStart + i}` })
                )
            );

            const results = await Promise.allSettled(promises);

            results.forEach(res => {
                if (res.status === 'fulfilled') {
                    expect(res.value.status).toBeLessThan(500);
                    expect(res.value.body?.data?.id).toBeDefined();
                } else {
                    console.error('Error en una request (batch):', res.reason);
                    fail('Una request falló inesperadamente');
                }
            });
        }

        const end = Date.now();
        const duration = end - start;

        expect(duration).toBeLessThan(10000);
        console.log(`Se crearon x100 productos en ${duration}ms (con batches de ${BATCH_SIZE})`);
    }, 12000);


    it('Debería listar todos los productos en menos de 1s', async () => {
        const start = Date.now();

        const res = await request(app.getHttpServer())
            .get('/products')
            .set('Authorization', `Bearer ${adminToken}`);

        const end = Date.now();
        const duration = end - start;

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(duration).toBeLessThan(1000);

        console.log(`Se consiguieron todos los productos en ${duration}ms`);
    });

    it('Debería obtener un producto por ID en menos de 1s', async () => {
        const createRes = await request(app.getHttpServer())
            .post('/products')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'LookupProduct', price: 50, stock: 10 });

        const productId = createRes.body.data.id;

        const start = Date.now();
        const res = await request(app.getHttpServer())
            .get(`/products/${productId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        const end = Date.now();
        const duration = end - start;

        expect(res.status).toBe(200);
        expect(res.body.data.id).toBe(productId);
        expect(duration).toBeLessThan(1000);

        console.log(`Se obtuvo un producto por id en ${duration}ms`);
    });

    it('Debería actualizar un producto en menos de 1s', async () => {
        const createRes = await request(app.getHttpServer())
            .post('/products')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'UpdateProduct', price: 25, stock: 5 });

        const productId = createRes.body.data.id;

        const start = Date.now();
        const res = await request(app.getHttpServer())
            .patch(`/products/${productId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ price: 35 });
        const end = Date.now();
        const duration = end - start;

        expect(res.status).toBe(200);
        expect(res.body.data.price).toBe(35);
        expect(duration).toBeLessThan(1000);

        console.log(`Se actualizo un producto en ${duration}ms`);
    });

    it('Debería eliminar un producto en menos de 1s', async () => {
        const createRes = await request(app.getHttpServer())
            .post('/products')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'DeleteProduct', price: 15, stock: 100 });

        const productId = createRes.body.data.id;

        const start = Date.now();

        const res = await request(app.getHttpServer())
            .delete(`/products/${productId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        const end = Date.now();
        const duration = end - start;

        expect(res.status).toBe(200);
        expect(res.body.data.message).toMatch(/Producto eliminado exitosamente/i);
        expect(duration).toBeLessThan(1000);

        console.log(`Se eliminó un producto en ${duration}ms`);
    });
});
