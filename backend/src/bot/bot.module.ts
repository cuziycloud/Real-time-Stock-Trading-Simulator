import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { UsersModule } from 'src/users/users.module';
import { OrdersModule } from 'src/orders/orders.module';
import { StocksModule } from 'src/stocks/stocks.module';

@Module({
  imports: [UsersModule, OrdersModule, StocksModule],
  providers: [BotService],
})
export class BotModule {}
