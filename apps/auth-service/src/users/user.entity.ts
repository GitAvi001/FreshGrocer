import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    email: string;

    @Column()
    passwordHash: string;

    @Column({ default: 'manager' }) // 'manager' | 'driver' | 'admin'
    role: string;
}
