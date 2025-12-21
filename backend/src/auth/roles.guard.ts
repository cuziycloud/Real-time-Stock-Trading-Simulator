import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from 'src/users/entities/user.entity';
import { ROLES_KEY } from './roles.decorator';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {} //Đọc metadata từ @Roles

  canActivate(context: ExecutionContext): boolean {
    // 1. Đọc yêu cầu role của route
    const requireRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requireRoles) return true; // Ko yc role: public endpoint: pass

    // 2. Lấy user từ request
    const { user } = context.switchToHttp().getRequest<{
      user: AuthenticatedUser;
    }>();

    // 3. Ktra role có nằm trong ds cho phép ko
    const hasRole = requireRoles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException('Bạn không có quyền truy cập (Admin Only)');
    }

    return true;
  }
}
