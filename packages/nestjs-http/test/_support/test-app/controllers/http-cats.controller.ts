import { UseGuards, UseInterceptors } from '@nestjs/common';
import { HttpController, HttpOperation } from '@opra/common';
import { AuthGuard } from '../providers/auth.guard.js';
import { TestInterceptor } from '../providers/test.interceptor.js';
import { CatsService } from '../services/cats.service.js';

@HttpController({
  path: 'cats',
  name: 'Cats',
})
export class HttpCatsController {
  static instanceCounter = 0;

  constructor(private readonly catsService: CatsService) {
    HttpCatsController.instanceCounter++;
  }

  @(HttpOperation({
    path: '@:id',
    mergePath: true,
  }).PathParam('id'))
  @UseGuards(AuthGuard)
  @UseInterceptors(TestInterceptor)
  get(): any {
    return this.catsService.getCat();
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(TestInterceptor)
  @(HttpOperation().PathParam('id'))
  list(): any[] {
    return this.catsService.getCats();
  }
}
