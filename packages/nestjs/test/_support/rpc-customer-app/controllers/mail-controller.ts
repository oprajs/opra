import { RpcController, RpcOperation } from '@opra/common';
import { KafkaContext } from '@opra/kafka';
import { SendMailDto } from '../dto/send-mail.dto.js';

@(RpcController({
  description: 'Mail consumer controller',
}).Header('access-token', 'string'))
export class MailController {
  // a: number;
  // constructor() {
  //   this.a = 1;
  // }

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
}
