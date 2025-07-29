import request from 'supertest';
import { app } from '@main/app';

describe('Orders integration test (w/ testcontainers)', () => {
    it('crea y persiste una orden real en Postgres', async () => {
        const orderRes = await request(app)
            .post('/api/orders')
            .send({
                orderId: 'pg_order_1',
                customerId: 'cust_pg',
                items: [{ productId: 'prod_pg', quantity: 1 }],
            })
            .expect(201);

        expect(orderRes.body.success).toBe(true);

        const processRes = await request(app)
            .post('/api/orders/pg_order_1/process')
            .send({ method: 'credit_card', cardNumber: '4111111111111111' })
            .expect(200);

        expect(processRes.body.success).toBe(true);
        expect(processRes.body.data.status).toBe('processed');
    });
});
