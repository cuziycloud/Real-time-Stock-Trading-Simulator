import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order, OrderStatus, OrderType } from './entities/order.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { StockPriceDto } from './dto/market-update.dto';
import { TradeStockDto } from 'src/users/dto/trade-stock.dto';
import { MarketService } from 'src/market/market.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private userService: UsersService,
    private marketService: MarketService,
  ) {}

  // 1. Đặt lệnh chờ
  async placeOrder(userId: number, dto: CreateOrderDto) {
    const user = await this.userService.findOne(userId);
    if (!user) throw new BadRequestException('User không tồn tại');

    let order = this.orderRepository.create({
      ...dto,
      user: user,
      status: OrderStatus.PENDING,
    });
    order = await this.orderRepository.save(order);

    const currentStock = this.marketService.getCurrentStock(dto.symbol); // Lấy cổ phiếu đó hiện tại
    const isMatched = this.checkMatchCondition(
      dto.direction,
      dto.targetPrice,
      currentStock.price,
    );

    if (isMatched) {
      const executedOrder = await this.executeOrder(order, currentStock.price);

      if (executedOrder) {
        return executedOrder;
      }
    }

    // Check số dư => tiền tạm ứng (Coming...)

    return order;
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
      const isMatched = this.checkMatchCondition(
        order.direction,
        Number(order.targetPrice), // Giá mong muốn
        marketPrice,
      );

      if (isMatched) {
        const result = await this.executeOrder(order, marketPrice);
        if (result) {
          matchOrders.push(result);
        }
      }
    }
    return matchOrders;
  }

  // 4. Hủy lệnh
  async cancelOrder(userId: number, orderId: number) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, user: { id: userId } },
    });

    if (!order) throw new BadRequestException('Lệnh không tồn tại');

    if (order.status !== OrderStatus.PENDING)
      throw new BadRequestException('Chỉ có thể hủy lệnh đang chờ (PENDING)');

    order.status = OrderStatus.CANCELLED;

    return await this.orderRepository.save(order);
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

  private checkMatchCondition(
    direction: OrderType,
    targetPrice: number,
    marketPrice: number,
  ): boolean {
    if (direction === OrderType.BUY && marketPrice <= targetPrice) {
      return true;
    }
    if (direction === OrderType.SELL && marketPrice >= targetPrice) {
      return true;
    }
    return false;
  }
}
