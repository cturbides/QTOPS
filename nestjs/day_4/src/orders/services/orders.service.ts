import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@users/entities/user.entity';
import { Role } from '@common/constants/roles.enum';
import { Order } from '@orders/entities/order.entity';
import { CreateOrderDto } from '@orders/dto/create-order.dto';
import { UpdateOrderDto } from '@orders/dto/update-order.dto';
import { OrderItem } from '@orders/entities/order-item.entity';
import { OrderStatus } from '@orders/constants/order-status.enum';
import { OrderResponseDto } from '@orders/dto/order.response.dto';
import { ProductsService } from '@products/services/products.service';
import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EntityNotFoundException, InsufficientPermissionsException } from '@common/exceptions/domain.exceptions';
import { InsufficientStockException, InvalidOrderStateException, ProductNotFoundException } from '@common/exceptions/ecommerce.exceptions';

@Injectable()
export class OrdersService {
  constructor(
    private readonly logger: Logger,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    private readonly productsService: ProductsService,
  ) { }

  async create(createOrderDto: CreateOrderDto, user: User): Promise<Order> {
    const items = createOrderDto.items;

    let totalPrice = 0;
    const orderItems: OrderItem[] = [];

    for (const item of items) {
      const product = await this.productsService.findById(item.productId);

      if (!product) {
        throw new ProductNotFoundException(item.productId);
      }

      if (product.stock < item.quantity) {
        throw new InsufficientStockException(product.name, item.quantity, product.stock);
      }

      totalPrice += Number(product.price) * item.quantity;

      const orderItem = this.orderItemRepo.create({
        product,
        price: product.price,
        quantity: item.quantity,
      });

      orderItems.push(orderItem);
    }

    const order = this.orderRepo.create({
      user,
      totalPrice,
      items: orderItems,
      status: OrderStatus.PENDING,
    });

    return this.orderRepo.save(order);
  }


  async findOne(id: string, user: User): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['user', 'items', 'items.product'],
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
    const order = await this.orderRepo.findOne({ where: { id }, relations: ['user', 'items', 'items.product'] });

    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }

    if (order.user.id !== user.id && !user.roles.includes(Role.ADMIN)) {
      throw new ForbiddenException('No tienes permiso para actualizar esta orden');
    }

    if (dto.status && !Object.values(OrderStatus).includes(dto.status)) {
      throw new ForbiddenException('Estado de orden inválido');
    }

    if (!user.roles.includes(Role.ADMIN) && dto.status !== OrderStatus.PENDING) {
      throw new ForbiddenException('No tienes permisos para actualizar el status de una orden');
    }

    Object.assign(order, dto);
    return this.orderRepo.save(order);
  }

  async cancelOrder(orderId: string, user: User): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['user', 'items', 'items.product'],
    });

    if (!order) {
      throw new EntityNotFoundException('Pedido', orderId);
    }

    if (order.user.id !== user.id && !user.roles.includes(Role.ADMIN)) {
      throw new InsufficientPermissionsException('cancelar', 'pedido');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new InvalidOrderStateException(order.status, 'cancelar');
    }

    order.status = OrderStatus.CANCELLED;
    return this.orderRepo.save(order);
  }

  async remove(id: string, user: User): Promise<void> {
    const order = await this.orderRepo.findOne({ where: { id }, relations: ['user', 'items', 'items.product'] });

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
      return this.orderRepo.find({ relations: ['user', 'items', 'items.product'] });
    }

    return this.orderRepo.find({ where: { user }, relations: ['user', 'items', 'items.product'] });
  }

  public toResponseDto(order: Order): OrderResponseDto {
    return {
      id: order.id,
      status: order.status,
      items: order.items.map(item => ({
        quantity: item.quantity,
        productId: item.product.id,
        productName: item.product.name,
      })),
      createdAt: order.createdAt,
      totalPrice: order.totalPrice,
    };
  }
}
