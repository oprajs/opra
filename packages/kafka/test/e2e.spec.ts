import { faker } from '@faker-js/faker';
import { ApiDocument } from '@opra/common';
import { ILogger } from '@opra/core';
import { KafkaAdapter, KafkaContext } from '@opra/kafka';
import { Producer } from 'kafkajs';
import { AsyncEventEmitter } from 'node-events-async';
import { TestController } from './_support/test-api/api/test-controller.js';
import { TestRpcApiDocument } from './_support/test-api/index.js';

const broker = process.env.KAFKA_BROKER;

declare global {
  namespace jest {
    interface Describe {
      skipIf(condition: boolean): typeof describe;
    }
  }
}
describe.skipIf = (condition: boolean) => (condition ? describe : describe.skip);
jest.setTimeout(30000);

describe.skipIf(!!broker)('e2e', () => {
  let document: ApiDocument;
  let adapter: KafkaAdapter;
  let producer: Producer;
  let instance: any;
  const logger: ILogger = {
    log() {},
    error() {},
  };

  async function waitForMessage(oprname: string, key: any): Promise<KafkaContext> {
    return new Promise((resolve, reject) => {
      const onMessage = async (_ctx: KafkaContext) => {
        if (_ctx.operation?.name === oprname && _ctx.key === key) {
          adapter.removeListener('error', onError);
          adapter.removeListener('after-execute', onMessage);
          resolve(_ctx);
        }
      };
      const onError = () => {
        adapter.removeListener('after-execute', onMessage);
        reject();
      };
      adapter.on('after-execute', onMessage);
      adapter.once('error', onError);
    });
  }

  beforeAll(async () => {
    document = await TestRpcApiDocument.create();
    adapter = new KafkaAdapter({
      document,
      client: {
        brokers: [broker!],
        clientId: 'opra-test',
      },
      logger,
    });
    await adapter.start();
    const admin = adapter.kafka.admin();
    await admin.connect();
    for (const topic of ['email-channel-1', 'email-channel-2', 'sms-channel-1', 'sms-channel-2']) {
      try {
        await admin.fetchTopicMetadata({ topics: [topic] });
      } catch (error) {
        continue;
      }
      await admin.deleteTopics({ topics: [topic] });
    }

    await admin.disconnect();
    producer = adapter.kafka.producer({
      allowAutoTopicCreation: true,
    });
    await producer.connect();
    await producer.connect();
    instance = adapter.getControllerInstance<TestController>('Test')!;
  });

  afterAll(async () => {
    await producer?.disconnect();
    await adapter?.close();
  }, 20000);
  afterAll(() => global.gc && global.gc());

  beforeEach(() => {
    instance.counters = {
      mailChannel1: 0,
      mailChannel2: 0,
      smsChannel1: 0,
      smsChannel2: 0,
    };
  });

  it('Should receive message from different groupId', async () => {
    const key = faker.string.alpha(5);
    const payload = {
      from: faker.internet.email(),
      to: faker.internet.email(),
      message: faker.string.alpha(5),
    };
    setTimeout(() => {
      producer
        .send({
          topic: 'email-channel-1',
          messages: [
            {
              key,
              value: JSON.stringify({
                ...payload,
                extraField: 12345,
              }),
              headers: {
                header1: 'header1-value',
                header2: '1234',
              },
            },
          ],
        })
        .catch(() => undefined);
    }, 500);
    const [ctx1, ctx2] = await Promise.all([waitForMessage('mailChannel1', key), waitForMessage('mailChannel2', key)]);
    expect(ctx1).toBeDefined();
    expect(ctx1?.key).toStrictEqual(key);
    expect(ctx1?.payload).toEqual(payload);
    expect(ctx1?.headers).toEqual({
      header1: 'header1-value',
      header2: 1234,
    });
    expect(ctx2).toBeDefined();
    expect(ctx2?.key).toStrictEqual(key);
    expect(ctx2?.payload).toEqual(payload);
    expect(ctx2?.headers).toEqual({
      header1: 'header1-value',
      header2: 1234,
    });
    const inst = adapter.getControllerInstance<TestController>('Test')!;
    expect(inst.counters).toEqual({
      mailChannel1: 1,
      mailChannel2: 1,
      smsChannel1: 0,
      smsChannel2: 0,
    });
  });

  it('Should listen regexp channel', async () => {
    const key = faker.string.alpha(5);
    const payload = {
      from: faker.internet.email(),
      to: faker.internet.email(),
      message: faker.string.alpha(5),
    };
    await producer.send({
      topic: 'sms-channel-2',
      messages: [
        {
          key,
          value: JSON.stringify({
            ...payload,
            extraField: 12345,
          }),
        },
      ],
    });
    const ctx1 = await waitForMessage('smsChannel2', key);
    expect(ctx1).toBeDefined();
    expect(ctx1?.key).toStrictEqual(key);
    expect(ctx1?.payload).toEqual(payload);
    expect(instance.counters).toEqual({
      mailChannel1: 0,
      mailChannel2: 0,
      smsChannel1: 0,
      smsChannel2: 1,
    });
  });

  it('Should receive message from same groupId', async () => {
    const key = faker.string.alpha(5);
    const payload = {
      from: faker.internet.email(),
      to: faker.internet.email(),
      message: faker.string.alpha(5),
    };
    await producer.send({
      topic: 'sms-channel-1',
      messages: [
        {
          key,
          value: JSON.stringify({
            ...payload,
            extraField: 12345,
          }),
        },
      ],
    });
    const [ctx1, ctx2] = await Promise.all([waitForMessage('smsChannel1', key), waitForMessage('smsChannel2', key)]);
    expect(ctx1).toBeDefined();
    expect(ctx1?.key).toStrictEqual(key);
    expect(ctx1?.payload).toEqual(payload);
    expect(ctx2).toBeDefined();
    expect(ctx2?.key).toStrictEqual(key);
    expect(ctx2?.payload).toEqual(payload);
    expect(instance.counters).toEqual({
      mailChannel1: 0,
      mailChannel2: 0,
      smsChannel1: 1,
      smsChannel2: 1,
    });
  });
});

function waitfor(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
