import { RpcController, RpcOperation } from '@opra/common';
import { SendMailDto } from '../dto/send-mail.dto.js';

@(RpcController({
  description: 'Mail consumer controller',
}).Header('access-token', 'string'))
export class MailConsumer {
  /**
   *
   */
  @RpcOperation(SendMailDto, {
    channel: 'send-email',
    groupId: 'test-group',
    keyType: 'uuid',
  })
  sendMail() {
    //
  }

  /**
   *
   */
  @(RpcOperation(SendMailDto, {
    channel: 'send-email',
    groupId: 'test-group',
    keyType: 'uuid',
  }).Header('header2', 'integer'))
  sendMail2() {
    //
  }

  /**
   *
   */
  @(RpcOperation(SendMailDto, {
    channel: 'send-email',
    groupId: 'test-group',
    keyType: 'uuid',
  })
    .Header('header2', 'integer')
    .Response('string', {
      channel: 'send-email-response',
    })
    .Header('access-token', 'string'))
  sendMail3() {
    //
  }
}
