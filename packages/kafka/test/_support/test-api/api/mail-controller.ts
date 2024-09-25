import { RpcController, RpcOperation } from '@opra/common';
import { KafkaContext } from '@opra/kafka';
import { SendMailDto } from '../dto/send-mail.dto.js';

@(RpcController({
  description: 'Mail consumer controller',
}).Header('access-token', 'string'))
export class MailController {
  initialized = false;
  closed = false;

  /**
   *
   */
  @(RpcOperation(SendMailDto, {
    channel: 'test-send-email',
  })
    .Kafka({
      consumer: 'group-1',
    })
    .Header('header2', 'integer')
    .Response('string', {
      channel: 'test-send-email-response',
    }))
  sendMail(ctx: KafkaContext) {
    return 'OK:' + ctx.rawMessage.timestamp;
  }

  /**
   *
   */
  @(RpcOperation(SendMailDto, {
    channel: 'test-send-email',
  })
    .Kafka(() => ({
      consumer: 'group-2',
    }))
    .Header('header2', 'integer'))
  sendMail2(ctx: KafkaContext) {
    return 'OK:' + ctx.rawMessage.timestamp;
  }

  @RpcController.OnInit()
  async onInit() {
    this.initialized = true;
  }

  @RpcController.OnShutdown()
  async onShutdown() {
    this.closed = true;
  }
}
