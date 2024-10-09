import { Injectable } from '@nestjs/common';
import { Cat } from './models/cat.js';

@Injectable()
export class CatsService {
  static instanceCounter = 0;
  static counters = {
    getCats: 0,
    getCat: 0,
    feedCat: 0,
  };

  constructor() {
    CatsService.instanceCounter++;
  }

  getCats(): Cat[] {
    CatsService.counters.getCats++;
    return [{ id: 1, name: 'Cat', age: 5 }];
  }

  getCat(): Cat {
    CatsService.counters.getCat++;
    return { id: 1, name: 'Cat', age: 5 };
  }

  feedCat() {
    CatsService.counters.feedCat++;
  }
}
