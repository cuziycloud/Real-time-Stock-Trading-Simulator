import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Portfolio } from './entities/portfolio.entity';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Portfolio)
    private portfolioRepository: Repository<Portfolio>,
  ) {}

  async createMockUser() {
    const user = this.userRepository.create({
      username: 'Tran My Van',
      balance: 100000000,
    });
    return this.userRepository.save(user);
  }

  async buyStock(
    userId: number,
    symbol: string,
    quantity: number,
    price: number,
  ) {
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

    return {
      status: 'Success',
      message: `Da mua ${quantity} co phieu ${symbol}`,
      currentBalance: user.balance,
      portfolio: portfolioItem,
    };
  }

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
