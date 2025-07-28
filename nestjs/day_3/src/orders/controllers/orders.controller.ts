import { Role } from '@common/constants/roles.enum';
import { Order } from '@orders/entities/order.entity';
import { AuthGuard } from '@common/decorators/auth.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { RolesGuard } from '@common/decorators/roles.guard';
import { UpdateOrderDto } from '@orders/dto/update-order.dto';
import { CreateOrderDto } from '@orders/dto/create-order.dto';
import { OrdersService } from '@orders/services/orders.service';
import { OrderResponseDto } from '@orders/dto/order.response.dto';
import { CacheInterceptor } from '@common/interceptors/cache.interceptor';
import { AuditInterceptor } from '@common/interceptors/audit.interceptor';
import { LoggingInterceptor } from '@common/interceptors/logging.interceptor';
import { AuthenticatedRequest } from '@common/types/authenticated-request.type';
import { ResponseTransformInterceptor } from '@common/interceptors/response-tranform.interceptor';
import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards, UseInterceptors, ValidationPipe, UsePipes } from '@nestjs/common';

@Controller('orders')
@UsePipes(new ValidationPipe({ transform: true }))
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(CacheInterceptor, LoggingInterceptor, AuditInterceptor, ResponseTransformInterceptor)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @Post()
  @Roles(Role.USER, Role.ADMIN)
  async create(@Body() createOrderDto: CreateOrderDto, @Request() req: AuthenticatedRequest): Promise<OrderResponseDto> {
    const order = await this.ordersService.create(createOrderDto, req.user);

    return this.ordersService.toResponseDto(order);
  }

  @Get()
  @Roles(Role.USER, Role.ADMIN)
  async findAll(@Request() req: AuthenticatedRequest): Promise<OrderResponseDto[]> {
    const orders: Order[] = await this.ordersService.findAll(req.user);

    return orders.map(order => this.ordersService.toResponseDto(order));
  }

  @Get(':id')
  @Roles(Role.USER, Role.ADMIN)
  async findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest): Promise<OrderResponseDto> {
    const order: Order = await this.ordersService.findOne(id, req.user);

    return this.ordersService.toResponseDto(order);
  }

  @Patch(':id')
  @Roles(Role.USER, Role.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @Request() req: AuthenticatedRequest
  ): Promise<OrderResponseDto> {
    console.log({ id, updateOrderDto, user: req.user });

    const order = await this.ordersService.update(id, updateOrderDto, req.user);
    return this.ordersService.toResponseDto(order);
  }

  @Delete(':id')
  @Roles(Role.USER, Role.ADMIN)
  async remove(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest
  ): Promise<{ message: string }> {
    await this.ordersService.remove(id, req.user);
    return { message: 'Order deleted successfully' };
  }
}