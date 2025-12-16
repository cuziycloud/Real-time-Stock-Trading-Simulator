import { Module } from '@nestjs/common';
import { StocksService } from './stocks.service';
import { StocksController } from './stocks.controller';

@Module({
  imports: [],
  controllers: [StocksController],
  providers: [StocksService],
})
export class StocksModule {}
