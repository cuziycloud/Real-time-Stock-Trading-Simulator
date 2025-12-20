import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';

@Injectable()
export class NoBotGuard implements CanActivate {
  canActivate(ctx: ExecutionContext) {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user: AuthenticatedUser }>();
    return !request.user.isBot;
  }
}
