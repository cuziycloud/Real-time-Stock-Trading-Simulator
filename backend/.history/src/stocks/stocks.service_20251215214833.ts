import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stock } from './entities/stock.entity';

@Injectable()
export class StocksService {
  constructor(
    @InjectRepository(Stock)
    private stockRepository: Repository<Stock>,

    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async findAll(): Promise<Stock[]> {
    const cachedData = await this.cacheManager.get<Stock[]>('all_stocks');

    if (cachedData) {
      console.log('Lay cache');
      return cachedData;
    }

    console.log('Lay tu db');
    const stocks = await this.stockRepository.find();

    await this.cacheManager.set('all_stocks', stocks, 60);
    return stocks;
  }
}
