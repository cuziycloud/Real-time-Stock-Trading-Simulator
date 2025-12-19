import { Module } from '@nestjs/common';
import { MarketService } from './market.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockHistory } from './entities/stock-history.entity';
import { MarketController } from './market.controller';

@Module({
  imports: [TypeOrmModule.forFeature([StockHistory])],
  controllers: [MarketController],
  providers: [MarketService],
  exports: [MarketService],
})
export class MarketModule {}
