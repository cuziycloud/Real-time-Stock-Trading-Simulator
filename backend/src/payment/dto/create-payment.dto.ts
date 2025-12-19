import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(10000, { message: 'Số tiền nạp tối thiểu là 10,000 VND' })
  amount: number;
}
