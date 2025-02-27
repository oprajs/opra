import { Injectable, Scope } from '@nestjs/common';
import { Dog } from '../models/dog.js';

@Injectable({ scope: Scope.REQUEST })
export class DogsService {
  static instanceCounter = 0;
  static counters = {
    getDogs: 0,
    getDog: 0,
    feedDog: 0,
  };

  constructor() {
    DogsService.instanceCounter++;
  }

  getDogs(): Dog[] {
    DogsService.counters.getDogs++;
    return [{ id: 1, name: 'Dog', age: 5 }];
  }

  getDog(): Dog {
    DogsService.counters.getDog++;
    return { id: 1, name: 'Dog', age: 5 };
  }

  feedDog() {
    DogsService.counters.feedDog++;
  }
}
