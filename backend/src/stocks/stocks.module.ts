import { Module } from '@nestjs/common';
import { StocksService } from './stocks.service';
import { StocksController } from './stocks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stock } from './entities/stock.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { StockHistory } from './entities/stock-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Stock, StockHistory]),
    CacheModule.register({
      ttl: 10000,
      max: 10,
    }),
  ],
  controllers: [StocksController],
  providers: [StocksService],
  exports: [StocksService],
})
export class StocksModule {}
