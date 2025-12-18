import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum OrderType {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum OrderStatus {
  PENDING = 'PENDING', // Chờ khớp
  MATCHED = 'MATCHED', // Đã khớp lệnh
  CANCELLED = 'CANCELLED', // User hủy/ ko đủ tiền khi khớp
}

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  symbol: string;

  @Column({ type: 'enum', enum: OrderType })
  direction: OrderType; // Mua / Bán

  @Column('int')
  quantity: number; // SL đặt

  @Column('decimal', { precision: 10, scale: 2 })
  targetPrice: number; // Giá mục tiêu (Đúng giá mới mua)

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.order)
  user: User;
}
