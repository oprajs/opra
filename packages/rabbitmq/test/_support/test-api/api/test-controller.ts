import { RpcController, RpcOperation } from '@opra/common';
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
  mailChannel() {
    TestController.counters.mailChannel++;
  }

  /**
   *
   */
  @(RpcOperation(SendMailDto, {
    channel: 'sms-channel',
  }).RabbitMQ({}))
  smsChannel() {
    TestController.counters.smsChannel++;
  }
}
