import { OrderStatus } from '../entities/order.entity';

export class CreateOrderItemDto {
    productId: number;
    quantity: number;
}

export class CreateOrderDto {
    userId: number;
    deliveryAddress: string;
    items: CreateOrderItemDto[];
}

export class UpdateOrderStatusDto {
    status: OrderStatus;
}

export class AssignDriverDto {
    driverId: number;
}

export class OrderItemResponseDto {
    id: number;
    productId: number;
    productName: string;
    quantity: number;
    priceAtOrder: number;
    subtotal: number;
    expirationDate: Date | null;
}

export class OrderResponseDto {
    id: number;
    userId: number;
    status: OrderStatus;
    totalPrice: number;
    deliveryAddress: string;
    driverId: number | null;
    orderItems: OrderItemResponseDto[];
    createdAt: Date;
    updatedAt: Date;
}

export class PaginatedOrdersDto {
    orders: OrderResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
