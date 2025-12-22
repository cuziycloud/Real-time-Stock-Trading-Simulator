import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order, OrderStatus, OrderType } from './entities/order.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { StockPriceDto } from './dto/market-update.dto';
import { TradeStockDto } from 'src/users/dto/trade-stock.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private userService: UsersService,
  ) {}

  // 1. Đặt lệnh chờ
  async placeOrder(userId: number, dto: CreateOrderDto) {
    const user = await this.userService.findOne(userId);
    if (!user) throw new BadRequestException('User không tồn tại');

    // Check số dư => tiền tạm ứng (Coming...)

    const newOrder = this.orderRepository.create({
      ...dto,
      user: user,
      status: OrderStatus.PENDING,
    });

    return await this.orderRepository.save(newOrder);
  }

  // 2. Lấy danh sách lệnh của user
  async getMyOrder(userId: number) {
    return this.orderRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  // 3. Hàm match lệnh (Gtt thay đổi - gọi hàm - quét danh sách lệnh)
  // Return Promise<Order[]>
  async matchOrders(marketData: StockPriceDto[]): Promise<Order[]> {
    // Lấy all lệnh pending
    const pendingOrders = await this.orderRepository.find({
      where: { status: OrderStatus.PENDING },
      relations: ['user'],
    });
    const matchOrders: Order[] = []; // Mảng chứa kết quả (KDL: Order)

    //console.log(`>>> Tìm thấy ${pendingOrders.length} lệnh PENDING`);

    if (pendingOrders.length === 0) return matchOrders;

    for (const order of pendingOrders) {
      const currentStock = marketData.find((s) => s.symbol === order.symbol);
      if (!currentStock) continue;

      const marketPrice = currentStock.price; // Gtt
      const targetPrice = Number(order.targetPrice); // Giá mong muốn
      let isMatched = false;

      // Mua: Gtt <= Giá muốn mua
      if (order.direction === OrderType.BUY && marketPrice <= targetPrice) {
        isMatched = true;
      }
      // Bán: gtt >= Giá muốn bán
      else if (
        order.direction === OrderType.SELL &&
        marketPrice >= targetPrice
      ) {
        isMatched = true;
      }

      if (isMatched) {
        const result = await this.executeOrder(order, marketPrice);
        if (result) {
          matchOrders.push(result);
        }
      }
    }
    return matchOrders;
  }

  private async executeOrder(
    order: Order,
    executionPrice: number,
  ): Promise<Order | null> {
    try {
      const tradeDto: TradeStockDto = {
        symbol: order.symbol,
        quantity: order.quantity,
        price: executionPrice,
      };
      if (order.direction === OrderType.BUY) {
        await this.userService.buyStock(order.user.id, tradeDto);
      } else {
        await this.userService.sellStock(order.user.id, tradeDto);
      }

      order.status = OrderStatus.MATCHED;
      const saveOrder = await this.orderRepository.save(order);
      return saveOrder;
    } catch (error) {
      console.log(`Lỗi khớp lệnh ${order.id}: ${error}`);
      order.status = OrderStatus.CANCELLED; // Không đủ số dư
      await this.orderRepository.save(order);
      return null;
    }
  }
}
