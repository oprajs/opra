import { UseGuards, UseInterceptors } from '@nestjs/common';
import { MQController, MQOperation } from '@opra/common';
import { Cat } from '../models/cat.js';
import { AuthGuard } from '../providers/auth.guard.js';
import { TestInterceptor } from '../providers/test.interceptor.js';
import { CatsService } from '../services/cats.service.js';

@(MQController({
  name: 'Cats',
  description: 'Cat consumer controller',
}).Header('access-token', 'string'))
export class RabbitmqCatsController {
  static instanceCounter = 0;

  constructor(private readonly catsService: CatsService) {
    RabbitmqCatsController.instanceCounter++;
  }

  /**
   *
   */
  @(MQOperation(Cat, {
    channel: 'feed-cat',
  }).Header('header1', 'integer'))
  // .Response('string', {
  //   channel: 'test-send-email-response',
  // }))
  @UseGuards(AuthGuard)
  @UseInterceptors(TestInterceptor)
  feedCat() {
    this.catsService.feedCat();
  }
}
