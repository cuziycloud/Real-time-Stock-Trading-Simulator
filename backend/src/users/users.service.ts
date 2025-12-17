import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Portfolio } from './entities/portfolio.entity';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { TradeStockDto } from './dto/trade-stock.dto';
import { Transaction } from './entities/transaction.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Portfolio)
    private portfolioRepository: Repository<Portfolio>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async createMockUser() {
    const user = this.userRepository.create({
      username: 'Tran My Van',
      balance: 100000000,
    });
    return this.userRepository.save(user);
  }

  async buyStock(dto: TradeStockDto) {
    const { userId, symbol, quantity, price } = dto;
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['portfolio'],
    });
    if (!user) throw new BadRequestException('User khong ton tai');

    const totalCost = quantity * price;

    if (user.balance < totalCost) {
      throw new BadRequestException(
        `Khong du so du! Can ${totalCost}, dang co ${user.balance}`,
      );
    }

    user.balance = Number(user.balance) - totalCost;
    await this.userRepository.save(user);
    let portfolioItem = await this.portfolioRepository.findOne({
      where: { user: { id: userId }, symbol: symbol },
    });

    if (portfolioItem) {
      portfolioItem.quantity += quantity;
    } else {
      portfolioItem = this.portfolioRepository.create({
        user: user,
        symbol: symbol,
        quantity: quantity,
        avgPrice: price,
      });
    }
    await this.portfolioRepository.save(portfolioItem);

    await this.transactionRepository.save({
      user: user,
      symbol: symbol,
      type: 'BUY',
      quantity: quantity,
      price: price,
      total: quantity * price,
      timestamp: new Date(), //Gan tay
    });

    return {
      status: 'Success',
      message: `Da mua ${quantity} co phieu ${symbol}`,
      currentBalance: user.balance,
      portfolio: portfolioItem,
    };
  }

  async findOne(id: number) {
    //tra ve balance + por hien co
    const user = await this.userRepository.findOne({
      where: { id: id },
      relations: ['portfolio'],
    });
    if (!user) throw new BadRequestException('User khong ton tai');

    return user;
  }

  async sellStock(dto: TradeStockDto) {
    const { userId, symbol, quantity, price } = dto;

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['portfolio'],
    });

    if (!user) throw new BadRequestException('User khogn ton tai');

    const portfolioItem = await this.portfolioRepository.findOne({
      where: {
        user: { id: userId },
        symbol: symbol,
      },
    });

    if (!portfolioItem)
      throw new BadRequestException(`Ban chua so huu ma ${symbol}`);

    if (portfolioItem.quantity < quantity)
      throw new BadRequestException(
        `So luong khong du. Ban co ${portfolioItem.quantity}, muon ban ${quantity}`,
      );

    const revenue = quantity * price;
    //
    const profitOrLoss = (price - Number(portfolioItem.avgPrice)) * quantity;
    console.log(`Gia trung binh: ${Number(portfolioItem.avgPrice)}`);
    console.log(`Giao dich nay ban lai/ lo: ${profitOrLoss}`);
    user.balance = Number(user.balance) + revenue;
    await this.userRepository.save(user);

    const remainingQuantity = portfolioItem.quantity - quantity;

    if (remainingQuantity === 0) {
      await this.portfolioRepository.remove(portfolioItem);
    } else {
      portfolioItem.quantity -= remainingQuantity;
      await this.portfolioRepository.save(portfolioItem);
    }

    await this.transactionRepository.save({
      user: user,
      symbol: symbol,
      type: 'SELL',
      quantity: quantity,
      price: price,
      total: quantity * price,
      timestamp: new Date(),
    });

    return {
      status: 'SUCCESS',
      message: `Da ban thanh cong ${quantity} co phieu ${symbol}`,
      revenue: revenue,
      profit: profitOrLoss,
      currentBalance: user.balance,
      remainingStock: remainingQuantity,
    };
  }

  async getTradeHistory(userId: number) {
    return this.transactionRepository.find({
      where: {
        user: { id: userId },
      },
      order: { createdAt: 'DESC' }, //Latest
    });
  }

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all users`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
