import { Product } from '@products/entities/product.entity';
import { CreateProductDto } from '@products/dto/create-product.dto';
import { ProductsService } from '@products/services/products.service';
import { ProductResponseDto } from '@products/dto/product-response.dto';
import { Controller, Get, Post, Body, Param, Patch, UseInterceptors, ClassSerializerInterceptor, UsePipes, ValidationPipe } from '@nestjs/common';

@Controller('products')
@UseInterceptors(ClassSerializerInterceptor)
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
  ) { }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() createProductDto: CreateProductDto): Promise<ProductResponseDto> {
    console.log('Creating product with DTO:', createProductDto);

    const product: Product = await this.productsService.create(createProductDto);

    return this.productsService.toResponseDto(product);
  }

  @Get()
  async findAll(): Promise<ProductResponseDto[]> {
    console.log('Retrieving all products');

    const products: Product[] = await this.productsService.findAll();

    return products.map(product => this.productsService.toResponseDto(product));
  }
}