import { UseGuards, UseInterceptors } from '@nestjs/common';
import { HttpController, HttpOperation } from '@opra/common';
import { AuthGuard } from '../providers/auth.guard.js';
import { TestInterceptor } from '../providers/test.interceptor.js';
import { DogsService } from '../services/dogs.service.js';

@HttpController({
  path: 'dogs',
  name: 'Dogs',
})
export class HttpDogsController {
  static instanceCounter = 0;

  constructor(private readonly dogsService: DogsService) {
    HttpDogsController.instanceCounter++;
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(TestInterceptor)
  @(HttpOperation({
    path: '@:id',
    mergePath: true,
  }).PathParam('id'))
  get(): any {
    return this.dogsService.getDog();
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(TestInterceptor)
  @(HttpOperation().PathParam('id'))
  list(): any[] {
    return this.dogsService.getDogs();
  }
}
