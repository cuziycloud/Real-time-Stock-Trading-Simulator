import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StocksModule } from './stocks/stocks.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsGateway } from './events/events.gateway';
import { UsersModule } from './users/users.module';

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
    StocksModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService, EventsGateway],
})
export class AppModule {}
