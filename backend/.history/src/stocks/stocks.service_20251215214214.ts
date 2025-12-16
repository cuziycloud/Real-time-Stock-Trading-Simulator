import { Inject, Injectable } from '@nestjs/common';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Stock } from './entities/stock.entity';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class StocksService {
  constructor(
    @InjectRepository(Stock)
    private stockRepository: Repository<Stock>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(createStockDto: CreateStockDto) {
    await this.cacheManager.delete('all_stocks')
    return await this.stockRepository.save(createStockDto);
  }
  async findAll() {
    return await this.stockRepository.find();
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
