import { UseGuards, UseInterceptors } from '@nestjs/common';
import { RpcController, RpcOperation } from '@opra/common';
import { Cat } from '../models/cat.js';
import { AuthGuard } from '../providers/auth.guard.js';
import { TestInterceptor } from '../providers/test.interceptor.js';
import { CatsService } from '../services/cats.service.js';

@(RpcController({
  name: 'Cats',
  description: 'Cat consumer controller',
}).Header('access-token', 'string'))
export class KafkaCatsController {
  static instanceCounter = 0;

  constructor(private readonly catsService: CatsService) {
    KafkaCatsController.instanceCounter++;
  }

  /**
   *
   */
  @(RpcOperation(Cat, {
    channel: 'feed-cat',
  })
    .Kafka({
      consumer: 'group-1',
    })
    .Header('header1', 'integer'))
  // .Response('string', {
  //   channel: 'test-send-email-response',
  // }))
  @UseGuards(AuthGuard)
  @UseInterceptors(TestInterceptor)
  feedCat() {
    this.catsService.feedCat();
  }
}
