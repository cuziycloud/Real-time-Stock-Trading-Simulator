import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StocksModule } from './stocks/stocks.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsGateway } from './events/events.gateway';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { OrdersModule } from './orders/orders.module';
import { MarketModule } from './market/market.module';
import { PaymentModule } from './payment/payment.module';
import { TelegramModule } from './telegram/telegram.module';
import { AlertsModule } from './alerts/alerts.module';
import { BotModule } from './bot/bot.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AdminModule } from './admin/admin.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      port: 3306,
      host: 'localhost',
      username: 'root',
      password: '',
      database: 'stock_db',
      //entities: [__dirname + '/**/*.entity{.ts, .js}'], //tu dong tim bang
      autoLoadEntities: true,
      synchronize: true, //Tu dong tao bang khi chay code
    }),
    ScheduleModule.forRoot(),
    StocksModule,
    UsersModule,
    AuthModule,
    OrdersModule,
    MarketModule,
    PaymentModule,
    TelegramModule,
    AlertsModule,
    BotModule,
    AdminModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [AppController],
  providers: [AppService, EventsGateway],
})
export class AppModule {}
