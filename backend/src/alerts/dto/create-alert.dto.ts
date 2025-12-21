import { IsEnum, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { AlertCondition } from '../entities/price-alert.entity';

export class CreateAlertDto {
  @IsNotEmpty()
  @IsString()
  symbol: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  targetPrice: number;

  @IsNotEmpty()
  @IsEnum(AlertCondition)
  condition: AlertCondition;
}
