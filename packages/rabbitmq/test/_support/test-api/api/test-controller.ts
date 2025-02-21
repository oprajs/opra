import { RpcController, RpcOperation } from '@opra/common';
import { RabbitmqContext } from '@opra/rabbitmq';
import { SendMailDto } from '../dto/send-mail.dto.js';

@(RpcController({
  description: 'Test controller',
  name: 'Test',
}).Header('access-token', 'string'))
export class TestController {
  static counters = {
    mailChannel: 0,
    smsChannel: 0,
  };

  /**
   *
   */
  @(RpcOperation(SendMailDto, {
    channel: 'email-channel',
  })
    .Header('header2', 'integer')
    .Response('string', {
      channel: 'test-send-email-response',
    }))
  mailChannel(ctx: RabbitmqContext) {
    TestController.counters.mailChannel++;
    return 'OK:' + ctx.properties.timestamp;
  }

  /**
   *
   */
  @(RpcOperation(SendMailDto, {
    channel: 'sms-channel',
  }).RabbitMQ({
    consumer: {
      priority: 1,
    },
  }))
  smsChannel(ctx: RabbitmqContext) {
    TestController.counters.smsChannel++;
    return 'OK:' + ctx.properties.timestamp;
  }
}
