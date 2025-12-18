import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Portfolio } from './portfolio.entity';
import { Transaction } from './transaction.entity';
import { Order } from 'src/orders/entities/order.entity';

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

  @OneToMany(() => Portfolio, (portfolio) => portfolio.user)
  portfolio: Portfolio[];
  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transaction: Transaction[];
  @OneToMany(() => Order, (order) => order.user)
  order: Order[];
}
