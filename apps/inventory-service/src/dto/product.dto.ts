export class CreateProductDto {
    name: string;
    description?: string;
    price: number;
    stockQuantity: number;
    category?: string;
    lowStockThreshold?: number;
    isPerishable?: boolean;
    expirationDate?: Date;
    batchNumber?: string;
}

export class UpdateProductDto {
    name?: string;
    description?: string;
    price?: number;
    stockQuantity?: number;
    category?: string;
    lowStockThreshold?: number;
    isPerishable?: boolean;
    expirationDate?: Date;
    batchNumber?: string;
}

export class UpdateStockDto {
    stockQuantity: number;
}

export class PaginationDto {
    page?: number;
    limit?: number;
}

export class ProductResponseDto {
    id: number;
    name: string;
    description: string;
    price: number;
    stockQuantity: number;
    category: string;
    lowStockThreshold: number;
    isLowStock: boolean;
    isPerishable: boolean;
    expirationDate: Date | null;
    batchNumber: string | null;
    daysUntilExpiration: number | null;
    expirationStatus: 'expired' | 'critical' | 'warning' | 'normal' | 'n/a';
    createdAt: Date;
    updatedAt: Date;
}

export class PaginatedProductsDto {
    products: ProductResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
