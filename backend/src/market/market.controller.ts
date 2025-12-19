import { Controller, Get, Param, Query } from '@nestjs/common';
import { MarketService } from './market.service';

@Controller('market')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Get('history/:symbol')
  getHistory(
    @Param('symbol') symbol: string,
    @Query('limit') limit: string = '50',
  ) {
    return this.marketService.getHistoryBySymbol(symbol, parseInt(limit, 10));
  }
}
