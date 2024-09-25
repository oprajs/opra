import { CanActivate, Inject, Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class Guard implements CanActivate {
  static COUNTER = 0;
  static REQUEST_SCOPED_DATA: number[] = [];

  constructor(@Inject('REQUEST_ID') private requestId: number) {
    Guard.COUNTER++;
  }

  canActivate() {
    Guard.REQUEST_SCOPED_DATA.push(this.requestId);
    return true;
  }
}
