import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '@products/entities/product.entity';
import { CreateProductDto } from '@products/dto/create-product.dto';
import { UpdateProductDto } from '@products/dto/update-product.dto';
import { BusinessRuleViolationException, EntityNotFoundException } from '@common/exceptions/domain.exceptions';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>
  ) { }

  findById(id: string): Promise<Product | null> {
    return this.productRepo.findOne({ where: { id } });
  }

  findAll(): Promise<Product[]> {
    return this.productRepo.find();
  }

  async create(dto: CreateProductDto): Promise<Product> {
    const product = this.productRepo.create(dto);

    return this.productRepo.save(product);
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.productRepo.findOne({ where: { id } });

    if (!product) {
      throw new EntityNotFoundException('Producto no encontrado', id);
    }

    Object.assign(product, dto);
    return this.productRepo.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.productRepo.findOne({ where: { id }, relations: ['orderItems'] });

    if (!product) {
      throw new EntityNotFoundException('Producto no encontrado', id);
    }

    if (product.orders && product.orders.length > 0) {
      throw new BusinessRuleViolationException('El producto tiene órdenes asociadas y no puede eliminarse.');
    }

    await this.productRepo.remove(product);
  }

  toResponseDto(product: Product) {
    return {
      id: product.id,
      name: product.name,
      price: +product.price,
      stock: product.stock,
    };
  }
}
