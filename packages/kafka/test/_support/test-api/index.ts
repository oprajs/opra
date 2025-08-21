import { ApiDocumentFactory, OpraSchema } from '@opra/common';
import { KafkaAdapter } from '@opra/kafka';
import { TestController } from './api/test-controller.js';
import { SendMailDto } from './dto/send-mail.dto.js';

export namespace TestMQApiDocument {
  export async function create() {
    return ApiDocumentFactory.createDocument({
      spec: OpraSchema.SpecVersion,
      info: {
        title: 'TestKafkaApi',
        version: 'v1',
        description: 'Document description',
      },
      types: [SendMailDto],
      api: {
        transport: 'mq',
        platform: KafkaAdapter.PlatformName,
        name: 'TestService',
        description: 'test service',
        controllers: [TestController],
      },
    });
  }
}
