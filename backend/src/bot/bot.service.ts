import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { MarketService } from 'src/market/market.service';
import { CreateOrderDto } from 'src/orders/dto/create-order.dto';
import { OrderType } from 'src/orders/entities/order.entity';
import { OrdersService } from 'src/orders/orders.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class BotService {
  private botIds: number[] = []; //ID npc bot

  constructor(
    private usersService: UsersService,
    private ordersService: OrdersService,
    private marketService: MarketService,
  ) {}

  // Khởi tạo (chạy 1 lần khi sv bật)
  async onModuleInit() {
    await this.seedBots();
  }

  // Tạo npc bot
  async seedBots() {
    const botNames = ['Viper', 'Gumayusi', 'Ruler'];

    for (const name of botNames) {
      let bot = await this.usersService.findByUsername(name);
      if (!bot) {
        bot = await this.usersService.createBot(name);
      }
      this.botIds.push(bot.id);
    }
    console.log(`Bot System sẵn sàng! IDs: ${this.botIds.join(', ')}`);
  }

  // Hàm auto tạo trade
  @Cron('*/10 * * * * *')
  async runBotTrading() {
    if (this.botIds.length === 0) return;

    // 1. Lấy tt thị trường
    const stocks = this.marketService.getCurrentPrices();

    // 2. Chọn bot + thông số lệnh ngẫu nhiên
    const randomBotId =
      this.botIds[Math.floor(Math.random() * this.botIds.length)];
    const bot = await this.usersService.findOne(randomBotId);

    const randomStock = stocks[Math.floor(Math.random() * stocks.length)];
    let randomDirection = Math.random() > 0.5 ? OrderType.BUY : OrderType.SELL;
    let randomQuantity = (Math.floor(Math.random() * 50) + 1) * 10;

    if (randomDirection === OrderType.SELL) {
      const portfolioItem = bot.portfolio.find(
        (b) => b.symbol === randomStock.symbol,
      );
      if (!portfolioItem || portfolioItem.quantity <= 0) {
        randomDirection = OrderType.BUY;
      } else if (portfolioItem.quantity < randomQuantity) {
        randomQuantity = portfolioItem.quantity;
      }
    }

    const variation = randomStock.price * 0.05; // Biến động 5%
    const randomPrice =
      randomDirection === OrderType.BUY
        ? randomStock.price - Math.random() * variation // Mua thấp hơn xíu
        : randomStock.price + Math.random() * variation; // Bán cao hơn xíu

    const finalPrice = Number(randomPrice.toFixed(2));

    // 3. Tạo lệnh
    const orderDto: CreateOrderDto = {
      symbol: randomStock.symbol,
      direction: randomDirection,
      quantity: randomQuantity,
      targetPrice: finalPrice,
    };

    try {
      // 4. Gọi lệnh
      await this.ordersService.placeOrder(randomBotId, orderDto);
      console.log(
        `BOT #${randomBotId} đặt ${randomDirection} ${orderDto.symbol} | SL: ${orderDto.quantity} | Giá: ${finalPrice}`,
      );
    } catch (error) {
      console.log(`Bot lỗi: `, error);
    }
  }
}
