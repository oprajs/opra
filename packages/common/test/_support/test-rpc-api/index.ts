import { ApiDocumentFactory, OpraSchema } from '@opra/common';
import { MailConsumer } from './api/mail-consumer.js';
import { SendMailDto } from './dto/send-mail.dto.js';

export namespace TestRpcApiDocument {
  export async function create() {
    return ApiDocumentFactory.createDocument({
      spec: OpraSchema.SpecVersion,
      info: {
        title: 'TestRpcApi',
        version: 'v1',
        description: 'Document description',
      },
      types: [SendMailDto],
      api: {
        transport: 'rpc',
        platform: 'kafka',
        name: 'TestService',
        description: 'test service',
        controllers: [MailConsumer],
      },
    });
  }
}
