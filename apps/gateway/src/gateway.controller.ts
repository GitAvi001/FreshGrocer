import { Body, Controller, Get, Inject, Post, Put, Delete, Patch, Param, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { GatewayService } from './gateway.service';

@Controller()
export class GatewayController {
  constructor(
    private readonly gatewayService: GatewayService,
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    @Inject('INVENTORY_SERVICE') private readonly inventoryClient: ClientProxy,
  ) { }

  @Get('health')
  getHealth() {
    return { status: 'OK', service: 'API Gateway', timestamp: new Date().toISOString() };
  }

  // ========== Authentication Endpoints ==========
  @Post('auth/register')
  register(@Body() registerDto: { email: string; password: string; role?: string }) {
    return this.authClient.send({ cmd: 'register' }, registerDto);
  }

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
}
