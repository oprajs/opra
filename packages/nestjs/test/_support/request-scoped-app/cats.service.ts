import { Inject, Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class CatsService {
  static COUNTER = 0;
  constructor(@Inject('META') private readonly meta) {
    CatsService.COUNTER++;
  }

  getCats(): any[] {
    return [{ id: 1, name: 'Cat', age: 5 }];
  }
}
