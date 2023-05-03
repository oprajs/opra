import { UseGuards, UseInterceptors } from '@nestjs/common';
import { Collection } from '@opra/common';
import { Cat } from './cat.dto.js';
import { CatsService } from './cats.service.js';
import { Interceptor } from './logging.interceptor.js';
import { Guard } from './request-scoped.guard.js';

@Collection(Cat, {primaryKey: 'id'})
export class CatsResource {
  static COUNTER = 0;

  constructor(
      private readonly catsService: CatsService
  ) {
    CatsResource.COUNTER++;
  }

  @UseGuards(Guard)
  @UseInterceptors(Interceptor)
  @Collection.Get()
  get(): any[] {
    return this.catsService.getCats();
  }
}
