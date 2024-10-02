import { UseGuards, UseInterceptors } from '@nestjs/common';
import { RpcController, RpcOperation } from '@opra/common';
import { DogsService } from '../dogs.service.js';
import { Cat } from '../models/cat.js';
import { AuthGuard } from '../providers/auth.guard.js';
import { TestInterceptor } from '../providers/test.interceptor.js';

@(RpcController({
  name: 'Dogs',
  description: 'Dog consumer controller',
}).Header('access-token', 'string'))
export class KafkaDogsController {
  static instanceCounter = 0;

  constructor(private readonly dogsService: DogsService) {
    KafkaDogsController.instanceCounter++;
  }

  /**
   *
   */
  @(RpcOperation(Cat, {
    channel: 'feed-dog',
  })
    .Kafka({
      consumer: 'group-2',
    })
    .Header('header1', 'integer'))
  // .Response('string', {
  //   channel: 'test-send-email-response',
  // }))
  @UseGuards(AuthGuard)
  @UseInterceptors(TestInterceptor)
  feedCat() {
    this.dogsService.feedDog();
  }
}
