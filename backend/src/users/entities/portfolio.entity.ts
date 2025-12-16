import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Portfolio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  symbol: string;

  @Column('int')
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  avgPrice: number; // Gia von trung binh

  @ManyToOne(() => User, (user) => user.portfolio)
  user: User;
}
