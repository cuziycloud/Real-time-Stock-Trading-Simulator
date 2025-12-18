import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { TradeStockDto } from './dto/trade-stock.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';

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

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  findOne(@GetUser('id') userId: number) {
    return this.usersService.findOne(userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto); // Dau + de chuyen chuoi (string) 1 thanh number (1)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
