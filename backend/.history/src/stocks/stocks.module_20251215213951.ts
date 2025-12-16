import { Module } from '@nestjs/common';
import { StocksService } from './stocks.service';
import { StocksController } from './stocks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stock } from './entities/stock.entity';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [TypeOrmModule.forFeature([Stock]), CacheModule({})],
  controllers: [StocksController],
  providers: [StocksService],
})
export class StocksModule {}
