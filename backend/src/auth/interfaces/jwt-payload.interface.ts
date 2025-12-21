import { UserRole } from 'src/users/entities/user.entity';

export interface JwtPayload {
  role: UserRole;
  sub: number;
  email: string;
  username: string;
  iat?: number;
  exp?: number;
}
