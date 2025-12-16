import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity() // 1 bang trong db
export class Stock {
  @PrimaryGeneratedColumn() //ID tu tang
  id: number;

  @Column()
  symbol: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  companyName: string;

}