import { Role } from '@common/constants/roles.enum';
import { Order } from '@orders/entities/order.entity';
import { AuthGuard } from '@common/decorators/auth.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { Retry } from '@common/decorators/retry.decorator';
import { RolesGuard } from '@common/decorators/roles.guard';
import { UpdateOrderDto } from '@orders/dto/update-order.dto';
import { CreateOrderDto } from '@orders/dto/create-order.dto';
import { OrdersService } from '@orders/services/orders.service';
import { OrderResponseDto } from '@orders/dto/order.response.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CacheInterceptor } from '@common/interceptors/cache.interceptor';
import { AuditInterceptor } from '@common/interceptors/audit.interceptor';
import { LoggingInterceptor } from '@common/interceptors/logging.interceptor';
import { AuthenticatedRequest } from '@common/types/authenticated-request.type';
import { ResponseTransformInterceptor } from '@common/interceptors/response-tranform.interceptor';
import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards, UseInterceptors, ValidationPipe, UsePipes, Logger } from '@nestjs/common';

@ApiTags('Orders')
@Controller('orders')
@UsePipes(new ValidationPipe({ transform: true }))
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(CacheInterceptor, LoggingInterceptor, AuditInterceptor, ResponseTransformInterceptor)
export class OrdersController {
  constructor(
    private readonly logger: Logger,
    private readonly ordersService: OrdersService
  ) { }

  @Post()
  @Roles(Role.USER, Role.ADMIN)
  @Retry({ attempts: 3, delay: 1000 })
  @ApiOperation({ summary: 'Create an order' })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
    type: OrderResponseDto,
  })
  async create(@Body() createOrderDto: CreateOrderDto, @Request() req: AuthenticatedRequest): Promise<OrderResponseDto> {
    this.logger.log('Creating order', { user: req.user.id, createOrderDto });

    const order = await this.ordersService.create(createOrderDto, req.user);

    return this.ordersService.toResponseDto(order);
  }

  @Get()
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Get all orders' })
  async findAll(@Request() req: AuthenticatedRequest): Promise<OrderResponseDto[]> {
    this.logger.log('Fetching all orders', { user: req.user.id });

    const orders: Order[] = await this.ordersService.findAll(req.user);

    return orders.map(order => this.ordersService.toResponseDto(order));
  }

  @Get(':id')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Get order by ID' })
  async findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest): Promise<OrderResponseDto> {
    this.logger.log('Fetching order', { id, user: req.user.id });

    const order: Order = await this.ordersService.findOne(id, req.user);

    return this.ordersService.toResponseDto(order);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @Retry({ attempts: 3, delay: 1000 })
  @ApiOperation({ summary: 'Update an order' })
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @Request() req: AuthenticatedRequest
  ): Promise<OrderResponseDto> {
    this.logger.log('Updating order', { id, user: req.user.id, updateOrderDto });

    const order = await this.ordersService.update(id, updateOrderDto, req.user);

    return this.ordersService.toResponseDto(order);
  }

  @Patch(':id/cancel')
  @Roles(Role.USER, Role.ADMIN)
  @Retry({ attempts: 3, delay: 1000 })
  @ApiOperation({ summary: 'Cancel an order' })
  async cancel(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest
  ): Promise<OrderResponseDto> {
    this.logger.log('Cancelling order', { id, user: req.user.id });

    const order = await this.ordersService.cancelOrder(id, req.user);
    return this.ordersService.toResponseDto(order);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @Retry({ attempts: 3, delay: 1000 })
  @ApiOperation({ summary: 'Delete an order' })
  async remove(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest
  ): Promise<{ message: string }> {
    this.logger.log('Deleting order', { id, user: req.user.id });

    await this.ordersService.remove(id, req.user);

    return { message: 'Order deleted successfully' };
  }
}