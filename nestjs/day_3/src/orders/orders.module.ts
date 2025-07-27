import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@auth/auth.module';
import { UsersModule } from "@users/users.module";
import { CommonModule } from '@common/common.module';
import { Order } from '@orders/entities/order.entity';
import { OrdersService } from '@orders/services/orders.service';
import { OrdersController } from '@orders/controllers/orders.controller';

@Module({
  imports: [UsersModule, CommonModule, TypeOrmModule.forFeature([Order]), AuthModule],
  exports: [OrdersService],
  providers: [OrdersService],
  controllers: [OrdersController],
})
export class OrdersModule { }
