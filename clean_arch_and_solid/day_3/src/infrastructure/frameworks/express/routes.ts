import { Router } from 'express';
import { CONTAINER_TOKENS } from '@infrastructure/types/container.tokens';
import { container } from '@infrastructure/config/dependency-injection.config';
import { ProductController } from '@infrastructure/controllers/product.controller';

const router = Router();

const controller = container.get<ProductController>(CONTAINER_TOKENS.ProductController);

// Route
router.get('/products/:id', async (req, res) => {
    const response = await controller.getProduct({ params: req.params });
    res.status(response.statusCode).json(response.body);
});

router.get('/products', async (req, res) => {
    const response = await controller.getAllProducts();
    res.status(response.statusCode).json(response.body);
});

router.put('/products/:id', async (req, res) => {
    const response = await controller.updateProduct({
        params: req.params,
        body: req.body
    });

    res.status(response.statusCode).json(response.body);
});

export { router as routes };
