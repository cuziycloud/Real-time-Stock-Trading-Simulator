import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity() // 1 bang trong db
export class Stock {
    @PrimaryGeneratedColumn() //ID tu tang
    id: number;

    @Column()
    symbol: string;

    @Column()
    
}
