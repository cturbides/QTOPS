import { injectable, inject } from 'inversify';
import { ProductRequest } from '@application/dto/product.request';
import { CONTAINER_TOKENS } from "@infrastructure/types/container.tokens";
import { HttpRequest, HttpResponse } from "@infrastructure/types/http.types";
import { GetProductUseCase, GetAllProductsUseCase, UpdateProductUseCase } from "@application/index";

@injectable()
export class ProductController {
    constructor(
        @inject(CONTAINER_TOKENS.GetProductUseCase)
        private getProductUseCase: GetProductUseCase,
        @inject(CONTAINER_TOKENS.GetAllProductsUseCase)
        private getAllProductsUseCase: GetAllProductsUseCase,
        @inject(CONTAINER_TOKENS.UpdateProductUseCase)
        private updateProductUseCase: UpdateProductUseCase
    ) { }

    async getProduct(request: HttpRequest): Promise<HttpResponse> {
        try {
            const productId = request.params.id;
            console.log(`Obteniendo producto con ID: ${productId}`);

            const product = await this.getProductUseCase.execute(productId);

            return {
                statusCode: 200,
                body: { success: true, data: product }
            };
        } catch (error: any) {
            return {
                statusCode: 404,
                body: { success: false, error: error?.message || 'Error al obtener el producto' }
            };
        }
    }

    async getAllProducts(): Promise<HttpResponse> {
        try {
            console.log('Obteniendo todos los productos');
            const products = await this.getAllProductsUseCase.execute();

            return {
                statusCode: 200,
                body: { success: true, data: products }
            };
        } catch (error: any) {
            return {
                statusCode: 500,
                body: { success: false, error: error?.message || 'Error al obtener los productos' }
            };
        }
    }

    async updateProduct(request: HttpRequest): Promise<HttpResponse> {
        try {
            const productId = request.params.id;
            const productData = request.body as Partial<ProductRequest>;

            console.log(`Actualizando producto con ID: ${productId}`, productData);

            await this.updateProductUseCase.execute(productId, productData as Partial<ProductRequest>);

            return {
                statusCode: 200,
                body: { success: true, message: 'Producto actualizado correctamente' }
            };
        } catch (error: any) {
            return {
                statusCode: 404,
                body: { success: false, error: error?.message || 'Error al actualizar el producto' }
            };
        }
    }
}