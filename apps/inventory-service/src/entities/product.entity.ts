import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @Column({ type: 'int', default: 0 })
    stockQuantity: number;

    @Column({ default: 'general' })
    category: string; // 'vegetables', 'fruits', 'dairy', 'meat', 'fish', 'bakery', 'general'

    @Column({ type: 'int', default: 10 })
    lowStockThreshold: number;

    // Expiration tracking for perishable items
    @Column({ default: false })
    isPerishable: boolean;

    @Column({ type: 'date', nullable: true })
    expirationDate: Date;

    @Column({ nullable: true })
    batchNumber: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
