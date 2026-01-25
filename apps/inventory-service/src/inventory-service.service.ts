import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import {
  CreateProductDto,
  UpdateProductDto,
  UpdateStockDto,
  PaginationDto,
  ProductResponseDto,
  PaginatedProductsDto,
} from './dto/product.dto';

@Injectable()
export class InventoryServiceService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) { }

  /**
   * Create a new product
   */
  async createProduct(createProductDto: CreateProductDto): Promise<ProductResponseDto> {
    const product = this.productRepository.create(createProductDto);
    const savedProduct = await this.productRepository.save(product);
    return this.toProductResponse(savedProduct);
  }

  /**
   * Get all products with pagination
   */
  async getAllProducts(paginationDto: PaginationDto): Promise<PaginatedProductsDto> {
    const page = paginationDto.page || 1;
    const limit = paginationDto.limit || 10;
    const skip = (page - 1) * limit;

    const [products, total] = await this.productRepository.findAndCount({
      skip,
      take: limit,
      order: {
        expirationDate: 'ASC', // FIFO: Products expiring soon first
        createdAt: 'DESC',
      },
    });

    return {
      products: products.map(p => this.toProductResponse(p)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get product by ID
   */
  async getProductById(id: number): Promise<ProductResponseDto> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return this.toProductResponse(product);
  }

  /**
   * Update product
   */
  async updateProduct(id: number, updateProductDto: UpdateProductDto): Promise<ProductResponseDto> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    Object.assign(product, updateProductDto);
    const updatedProduct = await this.productRepository.save(product);
    return this.toProductResponse(updatedProduct);
  }

  /**
   * Update stock quantity
   */
  async updateStock(id: number, updateStockDto: UpdateStockDto): Promise<ProductResponseDto> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    product.stockQuantity = updateStockDto.stockQuantity;
    const updatedProduct = await this.productRepository.save(product);
    return this.toProductResponse(updatedProduct);
  }

  /**
   * Delete product
   */
  async deleteProduct(id: number): Promise<{ message: string }> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    await this.productRepository.remove(product);
    return { message: `Product ${product.name} deleted successfully` };
  }

  /**
   * Get low stock products
   */
  async getLowStockProducts(): Promise<ProductResponseDto[]> {
    const products = await this.productRepository
      .createQueryBuilder('product')
      .where('product.stockQuantity <= product.lowStockThreshold')
      .orderBy('product.stockQuantity', 'ASC')
      .getMany();

    return products.map(p => this.toProductResponse(p));
  }

  /**
   * Search products by name or category
   */
  async searchProducts(query: string, category?: string): Promise<ProductResponseDto[]> {
    const queryBuilder = this.productRepository.createQueryBuilder('product');

    if (query) {
      queryBuilder.where('LOWER(product.name) LIKE LOWER(:query)', { query: `%${query}%` });
    }

    if (category) {
      queryBuilder.andWhere('product.category = :category', { category });
    }

    const products = await queryBuilder.getMany();
    return products.map(p => this.toProductResponse(p));
  }

  /**
   * Get products expiring within specified days
   */
  async getExpiringProducts(days: number = 3): Promise<ProductResponseDto[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const products = await this.productRepository
      .createQueryBuilder('product')
      .where('product.isPerishable = :isPerishable', { isPerishable: true })
      .andWhere('product.expirationDate IS NOT NULL')
      .andWhere('product.expirationDate <= :futureDate', { futureDate })
      .andWhere('product.expirationDate >= :today', { today: new Date() })
      .orderBy('product.expirationDate', 'ASC')
      .getMany();

    return products.map(p => this.toProductResponse(p));
  }

  /**
   * Get expired products
   */
  async getExpiredProducts(): Promise<ProductResponseDto[]> {
    const today = new Date();

    const products = await this.productRepository
      .createQueryBuilder('product')
      .where('product.isPerishable = :isPerishable', { isPerishable: true })
      .andWhere('product.expirationDate IS NOT NULL')
      .andWhere('product.expirationDate < :today', { today })
      .orderBy('product.expirationDate', 'ASC')
      .getMany();

    return products.map(p => this.toProductResponse(p));
  }

  /**
   * Update expiration date for a product batch
   */
  async updateExpirationDate(id: number, expirationDate: Date, batchNumber?: string): Promise<ProductResponseDto> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    product.expirationDate = expirationDate;
    if (batchNumber) {
      product.batchNumber = batchNumber;
    }

    const updatedProduct = await this.productRepository.save(product);
    return this.toProductResponse(updatedProduct);
  }

  /**
   * Calculate days until expiration
   */
  private calculateDaysUntilExpiration(expirationDate: Date | null): number | null {
    if (!expirationDate) return null;

    const today = new Date();
    const expDate = new Date(expirationDate);
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }

  /**
   * Determine expiration status
   */
  private getExpirationStatus(daysUntilExpiration: number | null, isPerishable: boolean): 'expired' | 'critical' | 'warning' | 'normal' | 'n/a' {
    if (!isPerishable || daysUntilExpiration === null) return 'n/a';

    if (daysUntilExpiration < 0) return 'expired';
    if (daysUntilExpiration <= 1) return 'critical';
    if (daysUntilExpiration <= 3) return 'warning';
    return 'normal';
  }

  /**
   * Helper method to convert Product entity to ProductResponseDto
   */
  private toProductResponse(product: Product): ProductResponseDto {
    const daysUntilExpiration = this.calculateDaysUntilExpiration(product.expirationDate);
    const expirationStatus = this.getExpirationStatus(daysUntilExpiration, product.isPerishable);

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      stockQuantity: product.stockQuantity,
      category: product.category,
      lowStockThreshold: product.lowStockThreshold,
      isLowStock: product.stockQuantity <= product.lowStockThreshold,
      isPerishable: product.isPerishable,
      expirationDate: product.expirationDate,
      batchNumber: product.batchNumber,
      daysUntilExpiration,
      expirationStatus,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
