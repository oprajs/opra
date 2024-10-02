import { Injectable } from '@nestjs/common';
import { Cat } from './models/cat.js';

@Injectable()
export class CatsService {
  static instanceCounter = 0;
  feedCounter = 0;

  constructor() {
    CatsService.instanceCounter++;
  }

  getCats(): Cat[] {
    return [{ id: 1, name: 'Cat', age: 5 }];
  }

  getCat(): Cat {
    return { id: 1, name: 'Cat', age: 5 };
  }

  feedCat() {
    this.feedCounter++;
  }
}
