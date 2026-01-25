import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { OrderServiceService } from './order-service.service';
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  AssignDriverDto,
} from './dto/order.dto';

@Controller()
export class OrderServiceController {
  constructor(private readonly orderServiceService: OrderServiceService) { }

  @MessagePattern({ cmd: 'createOrder' })
  async createOrder(data: CreateOrderDto) {
    return this.orderServiceService.createOrder(data);
  }

  @MessagePattern({ cmd: 'getOrderById' })
  async getOrderById(data: { id: number }) {
    return this.orderServiceService.getOrderById(data.id);
  }

  @MessagePattern({ cmd: 'getOrdersByUser' })
  async getOrdersByUser(data: { userId: number }) {
    return this.orderServiceService.getOrdersByUser(data.userId);
  }

  @MessagePattern({ cmd: 'getAllOrders' })
  async getAllOrders() {
    return this.orderServiceService.getAllOrders();
  }

  @MessagePattern({ cmd: 'updateOrderStatus' })
  async updateOrderStatus(data: { id: number; updateStatusDto: UpdateOrderStatusDto }) {
    return this.orderServiceService.updateOrderStatus(data.id, data.updateStatusDto);
  }

  @MessagePattern({ cmd: 'assignDriver' })
  async assignDriver(data: { id: number; assignDriverDto: AssignDriverDto }) {
    return this.orderServiceService.assignDriver(data.id, data.assignDriverDto);
  }

  @MessagePattern({ cmd: 'cancelOrder' })
  async cancelOrder(data: { id: number }) {
    return this.orderServiceService.cancelOrder(data.id);
  }
}
