import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { UsersModule } from 'src/users/users.module';
import { OrdersModule } from 'src/orders/orders.module';
import { MarketModule } from 'src/market/market.module';

@Module({
  imports: [UsersModule, OrdersModule, MarketModule],
  providers: [BotService],
})
export class BotModule {}
