import { MsgController, MsgOperation } from '@opra/common';
import { SendMailDto } from '../dto/send-mail.dto.js';

@(MsgController({
  description: 'Mail consumer controller',
}).Header('access-token', 'string'))
export class MailConsumer {
  /**
   *
   */
  @MsgOperation(SendMailDto, {
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
  @(MsgOperation(SendMailDto, {
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
  @(MsgOperation(SendMailDto, {
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
