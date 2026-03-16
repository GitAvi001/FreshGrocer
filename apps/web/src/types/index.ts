// ─── Auth ───────────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'manager' | 'driver';

export interface AuthUser {
    id: number;
    email: string;
    role: UserRole;
}

export interface AuthResponse {
    access_token: string;
    user: AuthUser;
}

// ─── Products / Inventory ────────────────────────────────────────────────────

export type ExpirationStatus = 'expired' | 'critical' | 'warning' | 'normal' | 'n/a';

export type ProductCategory =
    | 'vegetables'
    | 'fruits'
    | 'dairy'
    | 'meat'
    | 'fish'
    | 'bakery'
    | 'general';

export interface Product {
    id: number;
    name: string;
    description: string | null;
    price: number;
    stockQuantity: number;
    category: ProductCategory | string;
    lowStockThreshold: number;
    isLowStock: boolean;
    isPerishable: boolean;
    expirationDate: string | null;
    batchNumber: string | null;
    daysUntilExpiration: number | null;
    expirationStatus: ExpirationStatus;
    createdAt: string;
    updatedAt: string;
}

export interface PaginatedProducts {
    products: Product[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface CreateProductPayload {
    name: string;
    description?: string;
    price: number;
    stockQuantity: number;
    category?: string;
    lowStockThreshold?: number;
    isPerishable?: boolean;
    expirationDate?: string;
    batchNumber?: string;
}

export type UpdateProductPayload = Partial<CreateProductPayload>;

// ─── Orders ─────────────────────────────────────────────────────────────────

export type OrderStatus =
    | 'pending'
    | 'confirmed'
    | 'preparing'
    | 'out_for_delivery'
    | 'delivered'
    | 'cancelled';

export interface OrderItem {
    id: number;
    productId: number;
    productName: string;
    quantity: number;
    priceAtOrder: number;
    subtotal: number;
    expirationDate: string | null;
}

export interface Order {
    id: number;
    userId: number;
    status: OrderStatus;
    totalPrice: number;
    deliveryAddress: string;
    driverId: number | null;
    orderItems: OrderItem[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateOrderPayload {
    userId: number;
    deliveryAddress: string;
    items: { productId: number; quantity: number }[];
}
