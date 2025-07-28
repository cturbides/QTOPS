import request from 'supertest';
import { fail } from 'node:assert';
import { describe } from 'node:test';
import { INestApplication } from '@nestjs/common';
import { TestHelper } from '@test/utils/test.helper';

describe('Performance: Users Module', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleRef = await TestHelper.createTestingModule();
        app = moduleRef.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('Debería crear 100 usuarios concurrentes en menos de 10s (con batches)', async () => {
        const baseUser = {
            name: 'PerfUser',
            email: 'perf@example.com',
            password: 'PerfPass123!',
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
                        .post('/users')
                        .send({
                            ...baseUser,
                            name: `${baseUser.name}-${batchStart + i}`,
                            email: `perfuser${batchStart + i}@example.com`,
                        })
                )
            );

            const results = await Promise.allSettled(promises);

            results.forEach(res => {
                if (res.status === 'fulfilled') {
                    expect(res.value.status).toBeLessThan(500);
                    expect(res.value.body?.id).toBeDefined();
                } else {
                    console.error('Error en una request (batch):', res.reason);
                    fail('Una request falló inesperadamente');
                }
            });
        }

        const end = Date.now();
        const duration = end - start;

        expect(duration).toBeLessThan(10000);
        console.log(`Se crearon x${TOTAL} usuarios en ${duration}ms (con batches de ${BATCH_SIZE})`);
    }, 12000);

    it('Debería buscar un usuario por email en menos de 1s', async () => {
        const email = 'lookupuser@example.com';

        const createRes = await request(app.getHttpServer())
            .post('/users')
            .send({
                email: email,
                name: 'Lookup User',
                password: 'Lookup123!',
            });

        expect(createRes.status).toBeLessThan(500);

        const start = Date.now();
        const res = await request(app.getHttpServer())
            .get(`/users/${email}`);
        const end = Date.now();
        const duration = end - start;

        expect(res.status).toBe(200);
        expect(res.body.email).toBe(email);
        expect(duration).toBeLessThan(1000);

        console.log(`Se buscó el usuario por email en ${duration}ms`);
    });

    it('Debería actualizar el perfil de usuario en menos de 1s', async () => {
        const email = 'updateuser@example.com';

        const createRes = await request(app.getHttpServer())
            .post('/users')
            .send({
                name: 'Update User',
                email,
                password: 'Update123!',
            });

        expect(createRes.status).toBeLessThan(500);

        const start = Date.now();
        const res = await request(app.getHttpServer())
            .patch(`/users/${email}`)
            .send({ name: 'UpdatedName' });

        const end = Date.now();
        const duration = end - start;

        expect(res.status).toBe(200);
        expect(res.body.name).toBe('UpdatedName');
        expect(duration).toBeLessThan(1000);

        console.log(`Se actualizó el usuario en ${duration}ms`);
    });

    it('Debería loguear un usuario correctamente en menos de 1s', async () => {
        const email = 'loginuser@example.com';
        const password = 'Login123!';

        const createRes = await request(app.getHttpServer())
            .post('/users')
            .send({ name: 'Login User', email, password });

        expect(createRes.status).toBeLessThan(500);

        const start = Date.now();
        const res = await request(app.getHttpServer())
            .post('/users/login')
            .send({ email, password });

        const end = Date.now();
        const duration = end - start;

        expect(res.status).toBe(201);
        expect(res.body.accessToken).toBeDefined();
        expect(duration).toBeLessThan(1000);

        console.log(`Se logueó un usuario en ${duration}ms`);
    });
});
