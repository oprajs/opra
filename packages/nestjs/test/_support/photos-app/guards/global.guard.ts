import { CanActivate, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class TestGlobalGuard implements CanActivate {
  static counter = 0;

  constructor(private readonly _reflector: Reflector) {
  }

  async canActivate(): Promise<boolean> {
    TestGlobalGuard.counter++;
    return true;
  }

}
