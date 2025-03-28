import { UseGuards, UseInterceptors } from '@nestjs/common';
import { RpcController, RpcOperation } from '@opra/common';
import { Cat } from '../models/cat.js';
import { AuthGuard } from '../providers/auth.guard.js';
import { TestInterceptor } from '../providers/test.interceptor.js';
import { DogsService } from '../services/dogs.service.js';

@(RpcController({
  name: 'Dogs',
  description: 'Dog consumer controller',
}).Header('access-token', 'string'))
export class RabbitmqDogsController {
  static instanceCounter = 0;

  constructor(private readonly dogsService: DogsService) {
    RabbitmqDogsController.instanceCounter++;
  }

  /**
   *
   */
  @(RpcOperation(Cat, {
    channel: 'feed-dog',
  }).Header('header1', 'integer'))
  // .Response('string', {
  //   channel: 'test-send-email-response',
  // }))
  @UseGuards(AuthGuard)
  @UseInterceptors(TestInterceptor)
  feedDog() {
    this.dogsService.feedDog();
  }
}
