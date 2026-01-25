import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  AssignDriverDto,
  OrderResponseDto,
  OrderItemResponseDto,
} from './dto/order.dto';

interface ValidatedOrderItem {
  productId: number;
  productName: string;
  quantity: number;
  priceAtOrder: number;
  subtotal: number;
  expirationDate: Date | null;
  currentStock: number;
}

@Injectable()
export class OrderServiceService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @Inject('INVENTORY_SERVICE')
    private readonly inventoryClient: ClientProxy,
  ) { }

  /**
   * Create a new order with stock and expiration validation
   */
  async createOrder(createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    const { userId, deliveryAddress, items } = createOrderDto;

    // Validate all products exist, have sufficient stock, and are not expired
    const validatedItems = await this.validateOrderItems(items);

    // Calculate total price
    const totalPrice = validatedItems.reduce((sum, item) => sum + item.subtotal, 0);

    // Create order
    const order = this.orderRepository.create({
      userId,
      deliveryAddress,
      totalPrice,
      status: OrderStatus.PENDING,
    });

    const savedOrder = await this.orderRepository.save(order);

    // Create order items
    const orderItems = validatedItems.map(item => {
      const orderItem = this.orderItemRepository.create({
        orderId: savedOrder.id,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        priceAtOrder: item.priceAtOrder,
        subtotal: item.subtotal,
      });

      // Set expiration date if it exists
      if (item.expirationDate) {
        orderItem.expirationDate = item.expirationDate;
      }

      return orderItem;
    });

    await this.orderItemRepository.save(orderItems);

    // Reduce stock in inventory
    await this.reduceStock(validatedItems);

    return this.toOrderResponse(savedOrder, orderItems);
  }

  /**
   * Get order by ID
   */
  async getOrderById(id: number): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['orderItems'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return this.toOrderResponse(order, order.orderItems);
  }

  /**
   * Get all orders for a specific user
   */
  async getOrdersByUser(userId: number): Promise<OrderResponseDto[]> {
    const orders = await this.orderRepository.find({
      where: { userId },
      relations: ['orderItems'],
      order: { createdAt: 'DESC' },
    });

    return orders.map(order => this.toOrderResponse(order, order.orderItems));
  }

  /**
   * Get all orders (admin)
   */
  async getAllOrders(): Promise<OrderResponseDto[]> {
    const orders = await this.orderRepository.find({
      relations: ['orderItems'],
      order: { createdAt: 'DESC' },
    });

    return orders.map(order => this.toOrderResponse(order, order.orderItems));
  }

  /**
   * Update order status
   */
  async updateOrderStatus(id: number, updateStatusDto: UpdateOrderStatusDto): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['orderItems'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Validate status transition
    this.validateStatusTransition(order.status, updateStatusDto.status);

    order.status = updateStatusDto.status;
    const updatedOrder = await this.orderRepository.save(order);

    return this.toOrderResponse(updatedOrder, order.orderItems);
  }

  /**
   * Assign driver to order
   */
  async assignDriver(id: number, assignDriverDto: AssignDriverDto): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['orderItems'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    order.driverId = assignDriverDto.driverId;
    const updatedOrder = await this.orderRepository.save(order);

    return this.toOrderResponse(updatedOrder, order.orderItems);
  }

  /**
   * Cancel order and restore stock
   */
  async cancelOrder(id: number): Promise<{ message: string }> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['orderItems'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Only allow cancellation for pending or confirmed orders
    if (![OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(order.status)) {
      throw new BadRequestException(`Cannot cancel order with status: ${order.status}`);
    }

    // Restore stock
    await this.restoreStock(order.orderItems);

    // Update order status
    order.status = OrderStatus.CANCELLED;
    await this.orderRepository.save(order);

    return { message: `Order #${id} cancelled successfully` };
  }

  /**
   * Validate order items: check stock, expiration, and fetch product details
   */
  private async validateOrderItems(items: any[]): Promise<ValidatedOrderItem[]> {
    const validatedItems: ValidatedOrderItem[] = [];

    for (const item of items) {
      // Fetch product details from inventory
      const product = await firstValueFrom(
        this.inventoryClient.send({ cmd: 'getProductById' }, { id: item.productId })
      );

      if (!product) {
        throw new BadRequestException(`Product with ID ${item.productId} not found`);
      }

      // Check stock availability
      if (product.stockQuantity < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}, Requested: ${item.quantity}`
        );
      }

      // Check if product is expired or expiring critically (1 day or less)
      if (product.isPerishable && product.expirationStatus === 'expired') {
        throw new BadRequestException(
          `Product ${product.name} has expired and cannot be ordered`
        );
      }

      if (product.isPerishable && product.expirationStatus === 'critical') {
        throw new BadRequestException(
          `Product ${product.name} expires in ${product.daysUntilExpiration} day(s) and cannot be ordered`
        );
      }

      validatedItems.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        priceAtOrder: product.price,
        subtotal: product.price * item.quantity,
        expirationDate: product.expirationDate,
        currentStock: product.stockQuantity,
      });
    }

    return validatedItems;
  }

  /**
   * Reduce stock in inventory service
   */
  private async reduceStock(items: ValidatedOrderItem[]): Promise<void> {
    for (const item of items) {
      await firstValueFrom(
        this.inventoryClient.send(
          { cmd: 'updateStock' },
          {
            id: item.productId,
            updateStockDto: {
              stockQuantity: item.currentStock - item.quantity,
            },
          }
        )
      );
    }
  }

  /**
   * Restore stock when order is cancelled
   */
  private async restoreStock(orderItems: OrderItem[]): Promise<void> {
    for (const item of orderItems) {
      const product = await firstValueFrom(
        this.inventoryClient.send({ cmd: 'getProductById' }, { id: item.productId })
      );

      await firstValueFrom(
        this.inventoryClient.send(
          { cmd: 'updateStock' },
          {
            id: item.productId,
            updateStockDto: {
              stockQuantity: product.stockQuantity + item.quantity,
            },
          }
        )
      );
    }
  }

  /**
   * Validate status transitions
   */
  private validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): void {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
      [OrderStatus.PREPARING]: [OrderStatus.OUT_FOR_DELIVERY],
      [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`
      );
    }
  }

  /**
   * Convert Order entity to OrderResponseDto
   */
  private toOrderResponse(order: Order, orderItems: OrderItem[]): OrderResponseDto {
    return {
      id: order.id,
      userId: order.userId,
      status: order.status,
      totalPrice: Number(order.totalPrice),
      deliveryAddress: order.deliveryAddress,
      driverId: order.driverId,
      orderItems: orderItems.map(item => this.toOrderItemResponse(item)),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  /**
   * Convert OrderItem entity to OrderItemResponseDto
   */
  private toOrderItemResponse(item: OrderItem): OrderItemResponseDto {
    return {
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      priceAtOrder: Number(item.priceAtOrder),
      subtotal: Number(item.subtotal),
      expirationDate: item.expirationDate,
    };
  }
}
