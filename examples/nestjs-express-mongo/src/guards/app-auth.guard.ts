import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class AppAuthGuard implements CanActivate {
  static user = {
    id: 1,
    name: 'Test User',
  };

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const auth = req.get('Authorization');
    if (auth === 'reject-auth') throw new UnauthorizedException();
    req.user = AppAuthGuard.user;
    return true;
  }
}
