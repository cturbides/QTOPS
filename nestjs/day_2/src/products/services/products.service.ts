import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '@products/entities/product.entity';
import { SearchProductDto } from '@products/dto/search-product.dto';
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

  async findAll(filters: SearchProductDto): Promise<Product[]> {
    const queryBuilder = this.productRepository.createQueryBuilder('product');

    if (filters.name) {
      queryBuilder.andWhere('product.name LIKE :name', { name: `%${filters.name}%` });
    }

    if (filters.minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice: filters.minPrice });
    }

    if (filters.maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice: filters.maxPrice });
    }

    if (filters.tags && filters.tags.length > 0) {
      filters.tags.forEach((tag: string, i: number) => {
        queryBuilder.andWhere(`product.tags LIKE :tag${i}`, { [`tag${i}`]: `%${tag}%` });
      });
    }

    if (filters.sortOrder) {
      queryBuilder.orderBy('product.price', filters.sortOrder as 'DESC' | 'ASC');
    }

    return queryBuilder.getMany();
  }


  public toResponseDto(product: Product): ProductResponseDto {
    return plainToClass(ProductResponseDto, product, { excludeExtraneousValues: true });
  }
}
