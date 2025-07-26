// Task: Diseña un bounded context para "Shipping" 
//  que maneje el envío de pedidos, incluyendo entidades
//  como Shipment, Address, y ShippingMethod,
//  manteniendo su propio modelo optimizado para logística

import express from 'express';
import { shippingRoutes } from '@shipping/infrastructure/routes/shipping.routes';
import { orderRoutes } from '@order-management/infrastructure/routes/order.routes';

const app = express();
app.use(express.json());

app.use('/api/orders', orderRoutes);
app.use('/api/shipments', shippingRoutes);

app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});
