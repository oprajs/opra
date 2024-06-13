import { CanActivate, Injectable } from '@nestjs/common';

@Injectable()
export class TestGlobalGuard implements CanActivate {
  static counter = 0;

  async canActivate(): Promise<boolean> {
    TestGlobalGuard.counter++;
    return true;
  }
}
