import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { Portfolio } from './entities/portfolio.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([User, Portfolio])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
