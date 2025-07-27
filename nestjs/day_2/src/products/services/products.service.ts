import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '@products/entities/product.entity';
import { CreateProductDto } from '@products/dto/create-product.dto';
import { ProductResponseDto } from '@products/dto/product-response.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) { }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create({
      ...createProductDto,
    });

    return this.productRepository.save(product);
  }

  async findAll(): Promise<Product[]> {
    return this.productRepository.find();
  }


  public toResponseDto(product: Product): ProductResponseDto {
    return plainToClass(ProductResponseDto, product, { excludeExtraneousValues: true });
  }
}
