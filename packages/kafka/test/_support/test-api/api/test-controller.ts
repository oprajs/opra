import { RpcController, RpcOperation } from '@opra/common';
import { KafkaContext } from '@opra/kafka';
import { SendMailDto } from '../dto/send-mail.dto.js';

@(RpcController({
  description: 'Test controller',
  name: 'Test',
}).Header('access-token', 'string'))
export class TestController {
  static counters = {
    mailChannel1: 0,
    mailChannel2: 0,
    smsChannel1: 0,
    smsChannel2: 0,
  };

  /**
   *
   */
  @(RpcOperation(SendMailDto, {
    channel: 'email-channel-1',
  })
    .Kafka({
      consumer: 'group-1',
    })
    .Header('header2', 'integer')
    .Response('string', {
      channel: 'test-send-email-response',
    }))
  mailChannel1(ctx: KafkaContext) {
    TestController.counters.mailChannel1++;
    return 'OK:' + ctx.rawMessage.timestamp;
  }

  /**
   *
   */
  @(RpcOperation(SendMailDto, {
    channel: 'email-channel-1',
  })
    .Kafka(() => ({
      consumer: 'group-2',
    }))
    .Header('header2', 'integer'))
  mailChannel2(ctx: KafkaContext) {
    TestController.counters.mailChannel2++;
    return 'OK:' + ctx.rawMessage.timestamp;
  }

  /**
   *
   */
  @(RpcOperation(SendMailDto, {
    channel: 'sms-channel-1',
  }).Kafka({
    consumer: 'group-1',
  }))
  smsChannel1(ctx: KafkaContext) {
    TestController.counters.smsChannel1++;
    return 'OK:' + ctx.rawMessage.timestamp;
  }

  /**
   *
   */
  @(RpcOperation(SendMailDto, {
    channel: /^sms-channel-\d+/,
  }).Kafka({
    consumer: 'group-2',
  }))
  smsChannel2(ctx: KafkaContext) {
    TestController.counters.smsChannel2++;
    return 'OK:' + ctx.rawMessage.timestamp;
  }
}
