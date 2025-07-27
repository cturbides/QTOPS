import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '@products/entities/product.entity';
import { ProductsService } from '@products/services/products.service';
import { ProductsController } from '@products/controllers/products.controller';

@Module({
  exports: [ProductsService],
  providers: [ProductsService],
  controllers: [ProductsController],
  imports: [TypeOrmModule.forFeature([Product])],
})
export class ProductsModule { }
