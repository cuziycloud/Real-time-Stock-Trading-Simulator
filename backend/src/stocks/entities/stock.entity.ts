import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity() // 1 bang trong db
export class Stock {
  @PrimaryGeneratedColumn() //ID tu tang
  id: number;

  @Column()
  symbol: string;

  @Column('decimal', { precision: 10, scale: 2 }) //thap phan toi da 10 chu so, 2 chu so sau dau phay
  price: number;

  @Column('decimal', { precision: 10, scale: 2 })
  initialPrice: number; // Giá tham chiếu để tính % tăng giảm trong ngày

  @Column()
  companyName: string;

  @UpdateDateColumn()
  lastUpdated: Date; // Thời điểm cập nhật giá cuối cùng
}
