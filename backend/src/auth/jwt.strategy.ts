import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Lấy token từ Header
      ignoreExpiration: false, // Từ chối token hết hạn
      secretOrKey: 'SECRET_KEY_CLOUZ', // Key bí mật
    });
  }
  validate(payload: JwtPayload) {
    // Hàm chạy khi token hợp lệ
    return {
      id: payload.sub,
      email: payload.email,
      username: payload.username,
      role: payload.role,
      isBot: false,
    };
  }
}
