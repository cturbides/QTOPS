import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@users/entities/user.entity';
import { Role } from '@common/constants/roles.enum';
import { Order } from '@orders/entities/order.entity';
import { CreateOrderDto } from '@orders/dto/create-order.dto';
import { UpdateOrderDto } from '@orders/dto/update-order.dto';
import { OrderResponseDto } from '@orders/dto/order.response.dto';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) { }

  async create(dto: CreateOrderDto, user: User): Promise<Order> {
    const order = this.orderRepo.create({ ...dto, user });
    return this.orderRepo.save(order);
  }

  async findOne(id: string, user: User): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['user']
    });

    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }

    if (order.user.id !== user.id && !user.roles.includes(Role.ADMIN)) {
      throw new ForbiddenException('No tienes permiso para ver esta orden');
    }

    return order;
  }

  async update(id: string, dto: UpdateOrderDto, user: User): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id }, relations: ['user'] });

    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }

    if (order.user.id !== user.id && !user.roles.includes(Role.ADMIN)) {
      throw new ForbiddenException('No tienes permiso para actualizar esta orden');
    }

    console.log({ dto, order });

    Object.assign(order, dto);
    return this.orderRepo.save(order);
  }

  async remove(id: string, user: User): Promise<void> {
    const order = await this.orderRepo.findOne({ where: { id }, relations: ['user'] });

    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }

    if (order.user.id !== user.id && !user.roles.includes(Role.ADMIN)) {
      throw new ForbiddenException('No tienes permiso para eliminar esta orden');
    }

    await this.orderRepo.remove(order);
  }

  async findAll(user: User): Promise<Order[]> {
    if (user.roles.includes(Role.ADMIN)) {
      return this.orderRepo.find({ relations: ['user'] });
    }

    return this.orderRepo.find({ where: { user }, relations: ['user'] });
  }

  public toResponseDto(order: Order): OrderResponseDto {
    return {
      id: order.id,
      product: order.product,
      quantity: order.quantity,
      createdAt: order.createdAt,
      totalPrice: order.totalPrice,
    };
  }
}
