import { Product } from '@products/entities/product.entity';
import { SearchProductDto } from '@products/dto/search-product.dto';
import { CreateProductDto } from '@products/dto/create-product.dto';
import { ProductsService } from '@products/services/products.service';
import { ProductResponseDto } from '@products/dto/product-response.dto';
import { Controller, Get, Post, Body, UseInterceptors, ClassSerializerInterceptor, UsePipes, ValidationPipe, Query } from '@nestjs/common';

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
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAll(@Query() searchProductDto: SearchProductDto): Promise<ProductResponseDto[]> {
    console.log('Retrieving all products with filters:', searchProductDto);

    const products: Product[] = await this.productsService.findAll(searchProductDto);

    return products.map(product => this.productsService.toResponseDto(product));
  }
}