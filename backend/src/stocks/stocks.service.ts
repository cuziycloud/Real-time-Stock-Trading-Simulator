import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stock } from './entities/stock.entity';
import { StockHistory } from './entities/stock-history.entity';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { StockCandle } from './entities/stock-candle.entity';

@Injectable()
export class StocksService implements OnModuleInit {
  // Biến Cache RAM: dữ liệu Real-time
  private stocksCache: Stock[] = [];

  constructor(
    @InjectRepository(Stock)
    private stockRepository: Repository<Stock>,
    @InjectRepository(StockHistory)
    private stockHistoryRepository: Repository<StockHistory>,
    @InjectRepository(StockCandle)
    private stockCandleRepository: Repository<StockCandle>,
  ) {}

  // 1. START: Load dữ liệu từ DB lên RAM
  async onModuleInit() {
    this.stocksCache = await this.stockRepository.find();

    // Nếu DB trống trơn -> Seed dữ liệu mẫu
    if (this.stocksCache.length === 0) {
      await this.seedDefaultStocks();
    }

    console.log(`Đã load ${this.stocksCache.length} mã vào hệ thống.`);
  }

  // 2. LOGIC REAL-TIME
  // Lấy giá all nhanh (cho OrderService & Gateway)
  getRealtimePrices() {
    return this.stocksCache;
  }

  // Lấy 1 mã cụ thể (cho OrderService check khớp lệnh)
  getRealtimeStock(symbol: string) {
    const stock = this.stocksCache.find(
      (s) => s.symbol === symbol.toUpperCase(),
    );
    if (!stock) throw new NotFoundException(`Mã ${symbol} không tồn tại`);
    return stock;
  }

  // Engine biến động giá (Gateway gọi mỗi 5s)
  updateMarketPrices() {
    if (this.stocksCache.length === 0) return [];

    // A. Tính toán trên RAM
    this.stocksCache = this.stocksCache.map((s) => {
      const currentPrice = Number(s.price);
      const change = Math.random() * 1 - 0.5;
      let newPrice = currentPrice + change;
      if (newPrice < 1) newPrice = 1;

      // Update RAM
      s.price = Number(newPrice.toFixed(2));
      return s;
    });

    // B. Lưu DB (Stock & StockHistory)
    const savePromises = this.stocksCache.map((s) =>
      this.stockRepository.save(s),
    );

    // C. GỌI UPDATE NẾN: Duyệt qua từng mã và cập nhật nến tương ứng
    const candlePromises = this.stocksCache.map((s) =>
      this.updateCandle(s.symbol, Number(s.price)),
    );

    // Chạy song song tất cả (Fire & Forget)
    void Promise.all([...savePromises, ...candlePromises]);

    void this.persistData();

    return this.stocksCache;
  }

  // LOGIC GOM NẾN (AGGREGATION)
  private async updateCandle(symbol: string, price: number) {
    // 1. Tính thời điểm bắt đầu của phút hiện tại (vd 10:05:45 -> 10:05:00)
    const now = new Date();
    now.setSeconds(0, 0);

    // 2. Tìm xem đã có cây nến của phút này chưa?
    let candle = await this.stockCandleRepository.findOne({
      where: { symbol, startTime: now },
    });

    if (!candle) {
      // A. Chưa có -> Tạo mới (Open = High = Low = Close = Price hiện tại)
      candle = this.stockCandleRepository.create({
        symbol,
        startTime: now,
        open: price,
        high: price,
        low: price,
        close: price,
      });
    } else {
      // B. Đã có -> Cập nhật High/Low/Close
      candle.close = price; // Close luôn là giá mới nhất

      // Cập nhật High nếu giá mới phá đỉnh
      if (price > Number(candle.high)) {
        candle.high = price;
      }

      // Cập nhật Low nếu giá mới thủng đáy
      if (price < Number(candle.low)) {
        candle.low = price;
      }
    }

    await this.stockCandleRepository.save(candle);
  }

  // LẤY NẾN (Cho FE)
  async getCandles(symbol: string) {
    const candles = await this.stockCandleRepository.find({
      where: { symbol },
      order: { startTime: 'DESC' },
      take: 50, // 50 cây nến gần nhất
    });

    // Format dl chuẩn cho ApexCharts (x: time, y: [O, H, L, C])
    return candles.reverse().map((c) => ({
      x: c.startTime,
      y: [Number(c.open), Number(c.high), Number(c.low), Number(c.close)],
    }));
  }

  // LẤY NẾN (CHO AI)
  async getRecentCandles(symbol: string, limit: number = 10) {
    const candles = await this.stockCandleRepository.find({
      where: { symbol },
      order: { startTime: 'DESC' },
      take: limit,
    });

    // Trả về mảng nến thô (cũ -> mới)
    return candles.reverse();
  }

  private async persistData() {
    try {
      // 1. Update giá mới nhất vào bảng Stock (để restart ko bị mất giá)
      await this.stockRepository.save(this.stocksCache);

      // 2. Lưu vết lịch sử vào StockHistory
      const historyRecords = this.stocksCache.map((s) =>
        this.stockHistoryRepository.create({
          symbol: s.symbol,
          price: s.price,
        }),
      );
      await this.stockHistoryRepository.save(historyRecords);
    } catch (error) {
      console.log(`Lỗi lưu data: ${error}`);
    }
  }

  // 3. LOGIC CRUD (Cho Admin)
  async create(dto: CreateStockDto) {
    const newStock = this.stockRepository.create({
      ...dto,
      price: dto.price, // Giá khởi tạo
      initialPrice: dto.price,
    });
    await this.stockRepository.save(newStock);
    await this.onModuleInit(); // nhận diện mã mới ngay lập tức
    return newStock;
  }

  async update(id: number, dto: UpdateStockDto) {
    const stock = await this.stockRepository.findOne({ where: { id } });

    if (!stock) throw new NotFoundException('Không tìm thấy mã cổ phiếu này');

    await this.stockRepository.update(id, { ...dto });
    await this.onModuleInit(); // Reload
    return { message: 'Cập nhật thông tin cổ phiếu thành công' };
  }

  async remove(id: number) {
    const stock = await this.stockRepository.findOne({ where: { id } });

    if (!stock) throw new NotFoundException('Không tìm thấy mã cổ phiếu này');

    await this.stockRepository.remove(stock);
    await this.onModuleInit(); // Ngừng khớp lệnh loại mã này
    return { message: 'Xóa thông tin cổ phiếu thành công' };
  }

  async findAll() {
    return this.stockRepository.find();
  }

  // 4. API LỊCH SỬ (Cho Biểu đồ)
  async getHistoryBySymbol(symbol: string, limit: number = 50) {
    const data = await this.stockHistoryRepository.find({
      where: { symbol },
      order: { timestamp: 'DESC' },
      take: limit,
    });
    return data.reverse().map((item) => ({
      time: item.timestamp,
      price: Number(item.price),
    }));
  }

  // Ko có dl trong db: Seed Data
  private async seedDefaultStocks() {
    const defaults = [
      { symbol: 'VIC', companyName: 'Vingroup', price: 45.0 },
      { symbol: 'FPT', companyName: 'FPT Corp', price: 90.0 },
      { symbol: 'MWG', companyName: 'Mobile World', price: 50.0 },
    ];
    // Lưu từng cái
    for (const d of defaults) {
      await this.stockRepository.save(
        this.stockRepository.create({
          symbol: d.symbol,
          companyName: d.companyName,
          price: d.price,
          initialPrice: d.price,
        }),
      );
    }
    // Load lại vào cache
    this.stocksCache = await this.stockRepository.find();
  }
}
