import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum AlertCondition {
  ABOVE = 'ABOVE', // Báo khi giá >=
  BELOW = 'BELOW', // Báo khi giá <=
}

@Entity()
export class PriceAlert {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  symbol: string;

  @Column('decimal', { precision: 10, scale: 2 })
  targetPrice: number;

  @Column({ type: 'enum', enum: AlertCondition })
  condition: AlertCondition;

  @Column({ default: true })
  isActive: boolean; // true: đang chờ, false: đã bắn tin

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.alert)
  user: User;
}
