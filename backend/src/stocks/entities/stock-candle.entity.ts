import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

// Đánh Index để tìm theo mã và thời gian
@Entity()
@Index(['symbol', 'startTime'], { unique: true })
export class StockCandle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  symbol: string;

  // OHLC Data
  @Column('decimal', { precision: 10, scale: 2 })
  open: number;

  @Column('decimal', { precision: 10, scale: 2 })
  high: number;

  @Column('decimal', { precision: 10, scale: 2 })
  low: number;

  @Column('decimal', { precision: 10, scale: 2 })
  close: number;

  @Column()
  startTime: Date; // Thời gian bắt đầu cây nến (VD: 8:00:00)
}
