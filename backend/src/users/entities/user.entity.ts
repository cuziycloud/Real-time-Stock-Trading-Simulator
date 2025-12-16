import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Portfolio } from './portfolio.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column('decimal', { precision: 15, scale: 2, default: 100000000 })
  balance: number;

  @OneToMany(() => Portfolio, (portforlio) => portforlio.user)
  portfolio: Portfolio[];
}
