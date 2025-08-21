import { MQController, MQOperation } from '@opra/common';
import { SendMailDto } from '../dto/send-mail.dto.js';

@(MQController({
  description: 'Mail consumer controller',
}).Header('access-token', 'string'))
export class MailConsumer {
  /**
   *
   */
  @MQOperation(SendMailDto, {
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
  @(MQOperation(SendMailDto, {
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
  @(MQOperation(SendMailDto, {
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
