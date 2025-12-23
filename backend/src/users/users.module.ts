import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { Portfolio } from './entities/portfolio.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { StocksModule } from 'src/stocks/stocks.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Portfolio, Transaction]),
    StocksModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
