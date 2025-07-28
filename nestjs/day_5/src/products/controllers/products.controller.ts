import { Role } from '@common/constants/roles.enum';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@common/decorators/auth.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { RolesGuard } from '@common/decorators/roles.guard';
import { Product } from '@products/entities/product.entity';
import { ProductResponseDto } from '@products/dto/product.response';
import { UpdateProductDto } from '@products/dto/update-product.dto';
import { CreateProductDto } from '@products/dto/create-product.dto';
import { ProductsService } from '@products/services/products.service';
import { AuditInterceptor } from '@common/interceptors/audit.interceptor';
import { CacheInterceptor } from '@common/interceptors/cache.interceptor';
import { LoggingInterceptor } from '@common/interceptors/logging.interceptor';
import { ResponseTransformInterceptor } from '@common/interceptors/response-tranform.interceptor';
import { Controller, Get, Post, Body, Patch, Param, Delete, Logger, ValidationPipe, UseGuards, UsePipes, UseInterceptors } from '@nestjs/common';

@ApiTags('Products')
@Controller('products')
@UsePipes(new ValidationPipe({ transform: true }))
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(CacheInterceptor, LoggingInterceptor, AuditInterceptor, ResponseTransformInterceptor)
export class ProductsController {
  constructor(
    private readonly logger: Logger,
    private readonly productsService: ProductsService
  ) { }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all products' })
  async findAll(): Promise<ProductResponseDto[]> {
    this.logger.log('Fetching all products');
    const products = await this.productsService.findAll();
    return products.map(p => this.productsService.toResponseDto(p));
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get product by ID' })
  async findOne(@Param('id') id: string): Promise<ProductResponseDto> {
    this.logger.log(`Fetching product with id: ${id}`);

    const product: Product = await this.productsService.findById(id) as Product;

    return this.productsService.toResponseDto(product);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new product' })
  async create(@Body() dto: CreateProductDto): Promise<ProductResponseDto> {
    this.logger.log('Creating a new product');
    this.logger.debug(`Product DTO: ${JSON.stringify(dto)}`);

    const product = await this.productsService.create(dto);
    return this.productsService.toResponseDto(product);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a product' })
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto): Promise<ProductResponseDto> {
    this.logger.log(`Updating product with id: ${id}`);

    const product = await this.productsService.update(id, dto);
    return this.productsService.toResponseDto(product);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a product' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    this.logger.log(`Deleting product with id: ${id}`);

    await this.productsService.remove(id);
    return { message: 'Producto eliminado exitosamente' };
  }
}
