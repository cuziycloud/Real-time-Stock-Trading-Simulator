import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt'; // Thư viện băm mk
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingEmail = await this.usersService.findByEmail(
      registerDto.email,
    );
    if (existingEmail) throw new BadRequestException('Email này đã tồn tại');
    // Salt rounds: Độ khó khi băm - càng cao càng an toàn >< càng chậm
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(registerDto.password, salt);
    const newUser = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
      isBot: false,
    });

    return {
      message: 'Đăng ký thành công',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.username,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('User không tồn tại');
    if (user.isBot) {
      throw new UnauthorizedException('Bot account');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Mật khẩu không khớp');
    // Tao token (payload la thong tin nhet vao)
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };

    return {
      message: 'Đăng nhập thành công',
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        balance: user.balance,
      },
    };
  }
}
