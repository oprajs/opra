import { UseGuards, UseInterceptors } from '@nestjs/common';
import { HttpController, HttpOperation } from '@opra/common';
import { CatsService } from './cats.service.js';
import { Interceptor } from './logging.interceptor.js';
import { Guard } from './request-scoped.guard.js';

@HttpController()
export class CatsController {
  static COUNTER = 0;

  constructor(private readonly catsService: CatsService) {
    CatsController.COUNTER++;
  }

  @UseGuards(Guard)
  @UseInterceptors(Interceptor)
  @(HttpOperation({
    path: '@:id',
  }).PathParam('id'))
  get(): any[] {
    return this.catsService.getCats();
  }
}
