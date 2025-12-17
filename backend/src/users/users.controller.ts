import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { TradeStockDto } from './dto/trade-stock.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('init')
  createMock() {
    return this.usersService.createMockUser();
  }

  @Post('buy')
  buyStock(@Body() tradeDto: TradeStockDto) {
    return this.usersService.buyStock(tradeDto);
  }

  @Post('sell')
  sellStock(@Body() tradeDto: TradeStockDto) {
    return this.usersService.sellStock(tradeDto);
  }

  @Get(':id/history')
  getTradeHistory(@Param('id') id: string) {
    return this.usersService.getTradeHistory(+id);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id); // Dau + de chuyen chuoi (string) 1 thanh number (1)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
