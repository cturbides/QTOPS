import { Container } from 'inversify';
import { GetProductUseCase, GetAllProductsUseCase, UpdateProductUseCase } from '@application/index';
import { ProductController, InMemoryProductRepository, CONTAINER_TOKENS } from '@infrastructure/index';

const container = new Container();
container.bind<InMemoryProductRepository>(CONTAINER_TOKENS.ProductRepository).to(InMemoryProductRepository).inSingletonScope();
container.bind<GetProductUseCase>(CONTAINER_TOKENS.GetProductUseCase).to(GetProductUseCase).inRequestScope();
container.bind<GetAllProductsUseCase>(CONTAINER_TOKENS.GetAllProductsUseCase).to(GetAllProductsUseCase).inRequestScope();
container.bind<UpdateProductUseCase>(CONTAINER_TOKENS.UpdateProductUseCase).to(UpdateProductUseCase).inRequestScope();
container.bind<ProductController>(CONTAINER_TOKENS.ProductController).to(ProductController).inSingletonScope();

export { container };