// Task: Implementa un UpdateProductUseCase que permita actualizar el precio
//  de un producto, manteniendo la separación de capas y las reglas de dependencia

import express from 'express';
import { routes, config } from '@infrastructure/index';

const app = express();

app.use(express.json());
app.use('/api', routes);

app.listen(config.port, () => {
    console.log(`Servidor escuchando en http://localhost:${config.port}`);
});
