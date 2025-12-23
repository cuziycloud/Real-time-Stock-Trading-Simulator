import {
  Injectable,
  Logger,
  OnModuleInit,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stock } from './entities/stock.entity';
import { StockHistory } from './entities/stock-history.entity';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';

@Injectable()
export class StocksService implements OnModuleInit {
  private readonly logger = new Logger(StocksService.name);

  // Biến Cache RAM: dữ liệu Real-time
  private stocksCache: Stock[] = [];

  constructor(
    @InjectRepository(Stock)
    private stockRepository: Repository<Stock>,
    @InjectRepository(StockHistory)
    private stockHistoryRepository: Repository<StockHistory>,
  ) {}

  // 1. START: Load dữ liệu từ DB lên RAM
  async onModuleInit() {
    this.logger.log('Đang tải danh sách cổ phiếu từ DB lên RAM...');
    this.stocksCache = await this.stockRepository.find();

    // Nếu DB trống trơn -> Seed dữ liệu mẫu
    if (this.stocksCache.length === 0) {
      await this.seedDefaultStocks();
    }

    console.log(`Đã load ${this.stocksCache.length} mã vào hệ thống.`);
  }

  // 2. LOGIC REAL-TIME

  // Lấy giá nhanh (cho OrderService & Gateway)
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

    // B. Lưu xuống DB (Persistence) & Lưu Lịch sử (History)
    // Chạy ngầm (void) để không chặn luồng socket
    void this.persistData();

    return this.stocksCache;
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

  // --- 3. LOGIC CRUD (Cho Admin) ---

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
