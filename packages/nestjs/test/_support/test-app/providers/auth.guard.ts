import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  static instanceCounter = 0;
  static callCounter = 0;

  static user = {
    id: 1,
    name: 'Test User',
  };

  constructor() {
    AuthGuard.instanceCounter++;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    AuthGuard.callCounter++;
    const req = context.switchToHttp().getRequest();
    const auth = req.get('Authorization');
    if (auth === 'reject-auth') throw new UnauthorizedException();
    req.user = AuthGuard.user;
    return true;
  }
}
