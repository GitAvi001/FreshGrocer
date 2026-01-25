import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { InventoryServiceService } from './inventory-service.service';
import {
  CreateProductDto,
  UpdateProductDto,
  UpdateStockDto,
  PaginationDto,
} from './dto/product.dto';

@Controller()
export class InventoryServiceController {
  constructor(private readonly inventoryServiceService: InventoryServiceService) { }

  @MessagePattern({ cmd: 'createProduct' })
  async createProduct(data: CreateProductDto) {
    return this.inventoryServiceService.createProduct(data);
  }

  @MessagePattern({ cmd: 'getAllProducts' })
  async getAllProducts(data: PaginationDto) {
    return this.inventoryServiceService.getAllProducts(data);
  }

  @MessagePattern({ cmd: 'getProductById' })
  async getProductById(data: { id: number }) {
    return this.inventoryServiceService.getProductById(data.id);
  }

  @MessagePattern({ cmd: 'updateProduct' })
  async updateProduct(data: { id: number; updateProductDto: UpdateProductDto }) {
    return this.inventoryServiceService.updateProduct(data.id, data.updateProductDto);
  }

  @MessagePattern({ cmd: 'updateStock' })
  async updateStock(data: { id: number; updateStockDto: UpdateStockDto }) {
    return this.inventoryServiceService.updateStock(data.id, data.updateStockDto);
  }

  @MessagePattern({ cmd: 'deleteProduct' })
  async deleteProduct(data: { id: number }) {
    return this.inventoryServiceService.deleteProduct(data.id);
  }

  @MessagePattern({ cmd: 'getLowStockProducts' })
  async getLowStockProducts() {
    return this.inventoryServiceService.getLowStockProducts();
  }

  @MessagePattern({ cmd: 'searchProducts' })
  async searchProducts(data: { query: string; category?: string }) {
    return this.inventoryServiceService.searchProducts(data.query, data.category);
  }

  @MessagePattern({ cmd: 'getExpiringProducts' })
  async getExpiringProducts(data: { days?: number }) {
    return this.inventoryServiceService.getExpiringProducts(data.days || 3);
  }

  @MessagePattern({ cmd: 'getExpiredProducts' })
  async getExpiredProducts() {
    return this.inventoryServiceService.getExpiredProducts();
  }

  @MessagePattern({ cmd: 'updateExpirationDate' })
  async updateExpirationDate(data: { id: number; expirationDate: Date; batchNumber?: string }) {
    return this.inventoryServiceService.updateExpirationDate(data.id, data.expirationDate, data.batchNumber);
  }
}
