import { Injectable } from '@nestjs/common';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Stock } from './entities/stock.entity';
import { Repository } from 'typeorm';

@Injectable()
export class StocksService {
  constructor(
    @InjectRepository(Stock)
    private stockRepository: Repository<Stock>,
  ) {}

  async create(createStockDto: CreateStockDto){
    return await this.stockRepository.save(createStockDto);
  }
  async findAll() {
    return await this.stockRepository.find();
  }

  findOne(id: number) {return `Nothing`};
  update(id: number) {return `Nothing`}
}
