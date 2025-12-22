import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  MinLength,
} from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @IsNotEmpty()
  @MinLength(6, { message: 'Mật khẩu phải từ 6 ký tự' })
  password: string;

  @IsNotEmpty()
  @IsNumber()
  balance: number;

  @IsBoolean()
  isBot: boolean;

  @IsEnum(UserRole)
  role: UserRole;
}
