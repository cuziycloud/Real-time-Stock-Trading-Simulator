import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Query,
  Res,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { VnpayReturnDto } from './dto/vnpay-return.dto';
import type { Request, Response } from 'express';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('create_url')
  createPaymentUrl(
    @Body() dto: CreatePaymentDto,
    @GetUser('id') userId: number,
    @Req() req: Request, // Lấy IP
  ) {
    const ipAddr =
      (req.headers['x-forwarded-for'] as string) || //header chuẩn chứa IP Client
      req.socket.remoteAddress || // IP proxy/ chạy local
      '127.0.0.1'; // chạy local

    const url = this.paymentService.createPaymentUrl(
      dto.amount, // Lấy từ DTO
      userId,
      ipAddr,
    );

    return { url };
  }

  @Get('vnpay_return')
  async vnpayReturn(@Query() query: VnpayReturnDto, @Res() res: Response) {
    const result = await this.paymentService.handleVnPayReturn(query);

    if (result.code === '00') {
      return res.redirect('http://localhost:5173?vnp_status=success');
    } else {
      return res.redirect('http://localhost:5173?vnp_status=fail');
    }
  }
}
