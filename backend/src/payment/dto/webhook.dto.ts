import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class WebhookDto {
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  content: string; //"NAPTIEN USER_8"
}
