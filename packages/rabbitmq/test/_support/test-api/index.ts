import { ApiDocumentFactory, OpraSchema } from '@opra/common';
import { RabbitmqAdapter } from '@opra/rabbitmq';
import { TestController } from './api/test-controller.js';
import { SendMailDto } from './dto/send-mail.dto.js';

export namespace TestMQApiDocument {
  export async function create() {
    return ApiDocumentFactory.createDocument({
      spec: OpraSchema.SpecVersion,
      info: {
        title: 'TestRMQApi',
        version: 'v1',
        description: 'Document description',
      },
      types: [SendMailDto],
      api: {
        transport: 'mq',
        platform: RabbitmqAdapter.PlatformName,
        name: 'TestService',
        description: 'test service',
        controllers: [TestController],
      },
    });
  }
}
