import { Body, Controller, Get, Inject, Post, Put, Delete, Patch, Param, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { GatewayService } from './gateway.service';
import { Public } from './auth/public.decorator';

@Controller()
export class GatewayController {
  constructor(
    private readonly gatewayService: GatewayService,
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    @Inject('INVENTORY_SERVICE') private readonly inventoryClient: ClientProxy,
    @Inject('ORDER_SERVICE') private readonly orderClient: ClientProxy,
  ) { }

  @Public()
  @Get('health')
  getHealth() {
    return { status: 'OK', service: 'API Gateway', timestamp: new Date().toISOString() };
  }

  // ========== Authentication Endpoints ==========
  @Public()
  @Post('auth/register')
  async register(@Body() registerDto: { email: string; password: string; role?: string }) {
    console.log('Gateway: Registering user', registerDto.email);
    try {
      const result = await this.authClient.send({ cmd: 'register' }, registerDto).toPromise();
      console.log('Gateway: Register success');
      return result;
    } catch (error) {
      console.error('Gateway: Register error', error);
      throw error;
    }
  }

  @Public()
  @Post('auth/login')
  login(@Body() loginDto: { email: string; password: string }) {
    return this.authClient.send({ cmd: 'login' }, loginDto);
  }

  // ========== User Management Endpoints ==========
  @Post('users')
  createUser(@Body() createUserDto: { email: string; passwordHash: string }) {
    return this.authClient.send({ cmd: 'createUser' }, createUserDto);
  }

  @Get('users/:email')
  getUser(@Body() data: { email: string }) {
    return this.authClient.send({ cmd: 'getUser' }, data);
  }

  // ========== Product Management Endpoints ==========
  @Post('products')
  createProduct(@Body() createProductDto: {
    name: string;
    description?: string;
    price: number;
    stockQuantity: number;
    category?: string;
    lowStockThreshold?: number;
  }) {
    return this.inventoryClient.send({ cmd: 'createProduct' }, createProductDto);
  }

  @Get('products')
  getAllProducts(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.inventoryClient.send({ cmd: 'getAllProducts' }, { page, limit });
  }

  @Get('products/low-stock')
  getLowStockProducts() {
    return this.inventoryClient.send({ cmd: 'getLowStockProducts' }, {});
  }

  @Get('products/search')
  searchProducts(@Query('query') query: string, @Query('category') category?: string) {
    return this.inventoryClient.send({ cmd: 'searchProducts' }, { query, category });
  }

  @Get('products/expiring')
  getExpiringProducts(@Query('days') days?: number) {
    return this.inventoryClient.send({ cmd: 'getExpiringProducts' }, { days: days ? Number(days) : 3 });
  }

  @Get('products/expired')
  getExpiredProducts() {
    return this.inventoryClient.send({ cmd: 'getExpiredProducts' }, {});
  }

  @Get('products/:id')
  getProductById(@Param('id') id: number) {
    return this.inventoryClient.send({ cmd: 'getProductById' }, { id: Number(id) });
  }

  @Put('products/:id')
  updateProduct(
    @Param('id') id: number,
    @Body() updateProductDto: {
      name?: string;
      description?: string;
      price?: number;
      stockQuantity?: number;
      category?: string;
      lowStockThreshold?: number;
    }
  ) {
    return this.inventoryClient.send({ cmd: 'updateProduct' }, { id: Number(id), updateProductDto });
  }

  @Patch('products/:id/stock')
  updateStock(@Param('id') id: number, @Body() updateStockDto: { stockQuantity: number }) {
    return this.inventoryClient.send({ cmd: 'updateStock' }, { id: Number(id), updateStockDto });
  }

  @Delete('products/:id')
  deleteProduct(@Param('id') id: number) {
    return this.inventoryClient.send({ cmd: 'deleteProduct' }, { id: Number(id) });
  }

  // ========== Order Management Endpoints ==========
  @Post('orders')
  createOrder(@Body() createOrderDto: {
    userId: number;
    deliveryAddress: string;
    items: { productId: number; quantity: number }[];
  }) {
    return this.orderClient.send({ cmd: 'createOrder' }, createOrderDto);
  }

  @Get('orders/:id')
  getOrderById(@Param('id') id: number) {
    return this.orderClient.send({ cmd: 'getOrderById' }, { id: Number(id) });
  }

  @Get('orders/user/:userId')
  getOrdersByUser(@Param('userId') userId: number) {
    return this.orderClient.send({ cmd: 'getOrdersByUser' }, { userId: Number(userId) });
  }

  @Get('orders')
  getAllOrders() {
    return this.orderClient.send({ cmd: 'getAllOrders' }, {});
  }

  @Patch('orders/:id/status')
  updateOrderStatus(@Param('id') id: number, @Body() updateStatusDto: { status: string }) {
    return this.orderClient.send({ cmd: 'updateOrderStatus' }, { id: Number(id), updateStatusDto });
  }

  @Patch('orders/:id/driver')
  assignDriver(@Param('id') id: number, @Body() assignDriverDto: { driverId: number }) {
    return this.orderClient.send({ cmd: 'assignDriver' }, { id: Number(id), assignDriverDto });
  }

  @Delete('orders/:id')
  cancelOrder(@Param('id') id: number) {
    return this.orderClient.send({ cmd: 'cancelOrder' }, { id: Number(id) });
  }
}
