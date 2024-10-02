import { Injectable, Scope } from '@nestjs/common';
import { Dog } from './models/dog.js';

@Injectable({ scope: Scope.REQUEST })
export class DogsService {
  static instanceCounter = 0;
  feedCounter = 0;

  constructor() {
    DogsService.instanceCounter++;
  }

  getDogs(): Dog[] {
    return [{ id: 1, name: 'Dog', age: 5 }];
  }

  getDog(): Dog {
    return { id: 1, name: 'Dog', age: 5 };
  }

  feedDog() {
    this.feedCounter++;
  }
}
