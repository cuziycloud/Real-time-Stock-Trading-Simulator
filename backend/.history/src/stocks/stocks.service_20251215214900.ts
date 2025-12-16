import { Inject, Injectable } from '@nestjs/common';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Stock } from './entities/stock.entity';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import * as cacheManager_1 from 'cache-manager';

@Injectable()
export class StocksService {
  constructor(
    @InjectRepository(Stock)
    private stockRepository: Repository<Stock>,
    @Inject(CACHE_MANAGER) private cacheManager: cacheManager_1.Cache,
  ) {}

  async create(createStockDto: CreateStockDto) {
    await this.cacheManager.del('all_stocks');
    return await this.stockRepository.save(createStockDto);
  }
  async findAll() {
    const cachedData = await this.cacheManager.get('all_stocks');
    if (cachedData) {
      console.log('Lay cache');
      return cachedData;
    }
    console.log('Lay tu db');
    const stocks = await this.stockRepository.find();

    await this.cacheManager.set('all_stocks', stocks);
    return stocks;
  }

  findOne(id: number) {
    return `#${id}`;
  }
  update(id: number, updateStockDto: UpdateStockDto) {
    return `#${id}`;
  }
  remove(id: number) {
    return `#${id}`;
  }
}
