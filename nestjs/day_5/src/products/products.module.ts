import { Module } from '@nestjs/common';
import { AuthModule } from '@auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '@users/users.module';
import { CommonModule } from '@common/common.module';
import { Product } from '@products/entities/product.entity';
import { ProductsService } from '@products/services/products.service';
import { ProductsController } from '@products/controllers/products.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), AuthModule, CommonModule, UsersModule],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule { }
