import request from 'supertest';
import { app } from '@main/app';
import { container } from '@main/container';
import { CONTAINER_TOKENS } from '@shared-kernel/constants/container.tokens';
import { OrderCreatedEventHandler } from '@order-management/application/events/handlers/order-created.handler';
import { SimpleEventPublisher } from '@order-management/infrastructure/events/publisher/simple-event.publisher';
import { InMemoryShipmentRepository } from '@shipping/infrastructure/repositories/shipment.repository.in-memory';

describe('Orders + Shipping + Events Flow', () => {
    let publisher: SimpleEventPublisher;
    let handlerSpy: jest.SpyInstance;

    beforeAll(() => {
        publisher = container.get<SimpleEventPublisher>(CONTAINER_TOKENS.SimpleEventPublisher);

        const handler = new OrderCreatedEventHandler();

        handlerSpy = jest.spyOn(handler, 'handle');
        publisher.subscribe(handler);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('Debe crear y procesar una orden con tarjeta de crédito', async () => {
        // 1. Crear la orden
        const orderRes = await request(app)
            .post('/api/orders')
            .send({
                orderId: 'order_integration_ok',
                customerId: 'cust_1',
                items: [{ productId: 'prod_123', quantity: 2 }]
            })
            .expect(201);

        expect(orderRes.body.success).toBe(true);

        // 2. Procesar la orden
        const processRes = await request(app)
            .post('/api/orders/order_integration_ok/process')
            .send({ method: 'credit_card', cardNumber: '4111111111111111' })
            .expect(200);

        expect(processRes.body.success).toBe(true);
        expect(processRes.body.data.status).toBe('processed');
        expect(processRes.body.data.transactionId).toMatch(/^cc_/);

        // 3. Validar que el handler de eventos fue invocado
        expect(handlerSpy).toHaveBeenCalled();
    });

    it('Debe fallar al procesar una orden inexistente', async () => {
        const res = await request(app)
            .post('/api/orders/order_not_found/process')
            .send({ method: 'credit_card', cardNumber: '4111111111111111' })
            .expect(400);

        expect(res.body.success).toBe(false);
        expect(res.body.message).toMatch(/Orden no encontrada/);
    });

    it('Debe fallar si el monto excede límite de tarjeta', async () => {
        await request(app)
            .post('/api/orders')
            .send({
                orderId: 'order_big_amount',
                customerId: 'cust_2',
                items: [{ productId: 'prod_999', quantity: 200 }]
            })
            .expect(201);

        const res = await request(app)
            .post('/api/orders/order_big_amount/process')
            .send({ method: 'credit_card', cardNumber: '4111111111111111' })
            .expect(400);

        expect(res.body.success).toBe(false);
        expect(res.body.message).toMatch(/Monto excede límite/);
    });

    it('Debe fallar si se confirma una orden dos veces', async () => {
        await request(app)
            .post('/api/orders')
            .send({
                orderId: 'order_double',
                customerId: 'cust_double',
                items: [{ productId: 'prod_d', quantity: 1 }]
            })
            .expect(201);

        await request(app)
            .post('/api/orders/order_double/process')
            .send({ method: 'credit_card', cardNumber: '4111111111111111' })
            .expect(200);

        const res = await request(app)
            .post('/api/orders/order_double/process')
            .send({ method: 'credit_card', cardNumber: '4111111111111111' })
            .expect(400);

        expect(res.body.success).toBe(false);
        expect(res.body.message).toMatch(/ya ha sido confirmado/);
    });

    it('Debe fallar si el request de crear orden no tiene body', async () => {
        const res = await request(app).post('/api/orders').send(undefined).expect(400);
        expect(res.body.success).toBe(false);
    });

    it('Debe fallar al crear shipment con datos inválidos', async () => {
        const res = await request(app)
            .post('/api/shipments')
            .send({}) // faltan campos
            .expect(400);
        expect(res.body.success).toBe(false);
    });

    it('Debe crear un shipment y luego listarlo', async () => {
        const createShipmentRes = await request(app)
            .post('/api/shipments')
            .send({
                orderId: 'order_integration_ok',
                address: {
                    street: 'Av Siempre Viva',
                    city: 'Springfield',
                    country: 'USA',
                    zipCode: '12345'
                },
                shippingMethod: {
                    name: 'Express',
                    estimatedDays: 2
                }
            })
            .expect(201);

        expect(createShipmentRes.body.success).toBe(true);

        const shipmentsRes = await request(app)
            .get('/api/shipments')
            .expect(200);

        expect(shipmentsRes.body.success).toBe(true);
        expect(shipmentsRes.body.data.length).toBeGreaterThan(0);

        const shipment = shipmentsRes.body.data[0];
        expect(shipment).toHaveProperty('id');
    });
});
