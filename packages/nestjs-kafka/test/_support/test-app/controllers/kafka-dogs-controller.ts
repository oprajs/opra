import { UseGuards, UseInterceptors } from '@nestjs/common';
import { MQController, MQOperation } from '@opra/common';
import { Cat } from '../models/cat.js';
import { AuthGuard } from '../providers/auth.guard.js';
import { TestInterceptor } from '../providers/test.interceptor.js';
import { DogsService } from '../services/dogs.service.js';

@(MQController({
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
  @(MQOperation(Cat, {
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
  feedDog() {
    this.dogsService.feedDog();
  }
}
