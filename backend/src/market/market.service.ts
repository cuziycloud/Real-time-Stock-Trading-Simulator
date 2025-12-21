import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StockHistory } from './entities/stock-history.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MarketService {
  private stocks = [
    { symbol: 'FPT', price: 70.0 },
    { symbol: 'VNM', price: 55.9 },
    { symbol: 'VIC', price: 20.5 },
    { symbol: 'HPG', price: 32.4 },
    { symbol: 'TCB', price: 29.8 },
    { symbol: 'VCB', price: 85.6 },
    { symbol: 'BID', price: 48.2 },
    { symbol: 'MWG', price: 45.0 },
    { symbol: 'PNJ', price: 35.2 },
    { symbol: 'MX', price: 40.0 },
    { symbol: 'SSI', price: 28.5 },
    { symbol: 'VND', price: 22.6 },
    { symbol: 'POW', price: 15.4 },
    { symbol: 'HAG', price: 12.3 },
    { symbol: 'PHS', price: 12.8 },
    { symbol: 'ITA', price: 8.5 },
    { symbol: 'ROS', price: 6.2 },
    { symbol: 'FLC', price: 9.1 },
    { symbol: 'DXG', price: 17.8 },
  ];

  constructor(
    @InjectRepository(StockHistory)
    private stockHistory: Repository<StockHistory>,
  ) {}

  getCurrentPrices() {
    return this.stocks;
  }

  updateMarketPrices() {
    this.stocks = this.stocks.map((s) => {
      const change = Math.random() * 1 - 1;

      let newPrice = s.price + change;
      if (newPrice < 1) newPrice = 1;

      return {
        ...s,
        price: Number(newPrice.toFixed(2)),
      };
    });

    void this.saveHistoryLog(this.stocks);

    return this.stocks;
  }

  private async saveHistoryLog(stocks: { symbol: string; price: number }[]) {
    try {
      const historyRecords = stocks.map((s) =>
        this.stockHistory.create({
          symbol: s.symbol,
          price: s.price,
        }),
      );

      await this.stockHistory.save(historyRecords);
    } catch {
      console.error('Lỗi chuyển đổi');
    }
  }

  // Lấy lịch sử 1 điểm ảnh của giá
  async getHistoryBySymbol(symbol: string, limit: number = 50) {
    const data = await this.stockHistory.find({
      where: { symbol },
      order: { timestamp: 'DESC' }, // mới -> cũ
      take: limit, // Giới hạn bản ghi
    });

    // Đảo mảng => biểu đồ vẽ từ trái -> phải: cũ -> mới
    return data.reverse().map((item) => ({
      time: item.timestamp,
      price: Number(item.price),
    }));
  }
}
