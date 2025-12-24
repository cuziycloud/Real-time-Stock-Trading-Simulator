import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateOrderDto } from './dto/create-order.dto';
import { GetUser } from 'src/auth/get-user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('orders')
export class OrdersController {
  constructor(private readonly orderService: OrdersService) {}

  @Post('place')
  placeOrder(@Body() dto: CreateOrderDto, @GetUser('id') userId: number) {
    return this.orderService.placeOrder(userId, dto);
  }

  @Get('my-orders')
  getMyOrders(@GetUser('id') userId: number) {
    return this.orderService.getMyOrder(userId);
  }

  @Delete('cancel-order/:id')
  cancelOrder(@Param('id') id: number, @GetUser('id') userId: number) {
    return this.orderService.cancelOrder(userId, id);
  }
}
