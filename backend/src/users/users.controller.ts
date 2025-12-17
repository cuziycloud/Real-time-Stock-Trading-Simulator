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
import type { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
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
  buyStock(
    @Body() tradeDto: TradeStockDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.usersService.buyStock(user.id, tradeDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('sell')
  sellStock(
    @Body() tradeDto: TradeStockDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.usersService.sellStock(user.id, tradeDto);
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
