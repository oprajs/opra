import { ApiDocumentFactory, OpraSchema } from '@opra/common';
import { MailConsumer } from './api/mail-consumer.js';
import { SendMailDto } from './dto/send-mail.dto.js';

export namespace TestMQApiDocument {
  export async function create() {
    return ApiDocumentFactory.createDocument({
      spec: OpraSchema.SpecVersion,
      info: {
        title: 'TestMQApi',
        version: 'v1',
        description: 'Document description',
      },
      types: [SendMailDto],
      api: {
        transport: 'mq',
        platform: 'kafka',
        name: 'TestService',
        description: 'test service',
        controllers: [MailConsumer],
      },
    });
  }
}
