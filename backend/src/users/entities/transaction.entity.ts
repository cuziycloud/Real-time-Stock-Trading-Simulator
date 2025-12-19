import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  symbol: string;

  @Column({ type: 'enum', enum: ['BUY', 'SELL', 'DEPOSIT', 'WITHDRAW'] })
  type: string;

  @Column('int', { default: 1 }) // Mặc định 1 (lần) nếu nạp/rút
  quantity: number;

  @Column('decimal', { precision: 15, scale: 2 })
  price: number; //Gia tai thoi diem giao dịch/ Số tiền nạp/rút

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  total: number; //Tong tien = price * quantity

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.transaction) // 1 user co n transactions
  user: User;
}
