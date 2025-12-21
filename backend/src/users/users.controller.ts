import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { TradeStockDto } from './dto/trade-stock.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { NoBotGuard } from 'src/auth/noBotGuard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('init')
  createMock() {
    return this.usersService.createMockUser();
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('buy')
  buyStock(@Body() tradeDto: TradeStockDto, @GetUser('id') userId: number) {
    return this.usersService.buyStock(userId, tradeDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('sell')
  sellStock(@Body() tradeDto: TradeStockDto, @GetUser('id') userId: number) {
    return this.usersService.sellStock(userId, tradeDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('history')
  getTradeHistory(@GetUser('id') userId: number) {
    return this.usersService.getTradeHistory(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('deposit')
  deposit(@Body('amount') amount: number, @GetUser('id') userId: number) {
    // #Dùng dto để kiểm soát dl input
    return this.usersService.deposit(userId, amount);
  }

  @UseGuards(AuthGuard('jwt'), NoBotGuard)
  @Post('withdraw')
  withdraw(@Body('amount') amount: number, @GetUser('id') userId: number) {
    return this.usersService.withdraw(userId, amount);
  }

  @Get('leaderboard')
  getLeaderboard() {
    return this.usersService.getLeaderboard();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  findOne(@GetUser('id') userId: number) {
    return this.usersService.findOne(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('telegram-link')
  generateTelegramLink(@GetUser('id') userId: number) {
    return this.usersService.generateTelegramLinkCode(userId);
  }
}
