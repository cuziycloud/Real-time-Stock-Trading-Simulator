import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Portfolio } from './portfolio.entity';
import { Transaction } from './transaction.entity';
import { Order } from 'src/orders/entities/order.entity';
import { PriceAlert } from 'src/alerts/entities/price-alert.entity';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  balance: number;

  @Column({ nullable: true })
  telegramChatId: string; // id chat

  @Column({ nullable: true })
  telegramLinkCode: string; // mã lk tạm

  @Column({ default: false })
  isBot: boolean;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Portfolio, (portfolio) => portfolio.user)
  portfolio: Portfolio[];
  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transaction: Transaction[];
  @OneToMany(() => Order, (order) => order.user)
  order: Order[];
  @OneToMany(() => PriceAlert, (alert) => alert.user)
  alert: PriceAlert[];
}
