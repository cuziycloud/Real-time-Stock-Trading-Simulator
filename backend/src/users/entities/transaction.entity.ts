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

  @Column()
  symbol: string;

  @Column({ type: 'enum', enum: ['BUY', 'SELL'] })
  type: string;

  @Column('int')
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number; //Gia tai thoi diem giao dịch

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  total: number; //Tong tien = price * quantity

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.transaction) // 1 user co n transactions
  user: User;
}
