import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  username: string;

  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;
  @MinLength(6, { message: 'Mật khẩu phải từ 6 kí tự trở lên' })
  password: string;
}
