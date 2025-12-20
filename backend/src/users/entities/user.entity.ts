import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Portfolio } from './portfolio.entity';
import { Transaction } from './transaction.entity';
import { Order } from 'src/orders/entities/order.entity';
import { PriceAlert } from 'src/alerts/entities/price-alert.entity';

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

  @Column('decimal', { precision: 15, scale: 2, default: 100000000 })
  balance: number;

  @Column({ nullable: true })
  telegramChatId: string; // id chat

  @Column()
  telegramLinkCode: string; // mã lk tạm

  @OneToMany(() => Portfolio, (portfolio) => portfolio.user)
  portfolio: Portfolio[];
  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transaction: Transaction[];
  @OneToMany(() => Order, (order) => order.user)
  order: Order[];
  @OneToMany(() => PriceAlert, (alert) => alert.user)
  alert: PriceAlert[];
}
