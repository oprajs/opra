import { MsgController, MsgOperation } from '@opra/common';
import { KafkaContext } from '@opra/kafka';
import { SendMailDto } from '../dto/send-mail.dto.js';

@(MsgController({
  description: 'Mail consumer controller',
}).Header('access-token', 'string'))
export class MailController {
  initialized = false;
  closed = false;

  /**
   *
   */
  @(MsgOperation(SendMailDto, {
    channel: 'test-send-email',
  })
    .Kafka({
      groupId: 'group-1',
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
  @(MsgOperation(SendMailDto, {
    channel: 'test-send-email',
  })
    .Kafka(() => ({
      groupId: 'group-2',
    }))
    .Header('header2', 'integer'))
  sendMail2(ctx: KafkaContext) {
    return 'OK:' + ctx.rawMessage.timestamp;
  }

  @MsgController.OnInit()
  async onInit() {
    this.initialized = true;
  }

  @MsgController.OnShutdown()
  async onShutdown() {
    this.closed = true;
  }
}
