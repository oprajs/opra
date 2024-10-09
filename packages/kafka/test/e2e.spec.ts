import { faker } from '@faker-js/faker';
import { ApiDocument } from '@opra/common';
import { ILogger } from '@opra/core';
import { KafkaAdapter } from '@opra/kafka';
import { Kafka, logLevel, Producer } from 'kafkajs';
import { TestController } from './_support/test-api/api/test-controller.js';
import { TestRpcApiDocument } from './_support/test-api/index.js';
import { waitForMessage } from './_support/wait-for-message.js';

// set timeout to be longer (especially for the after hook)
jest.setTimeout(30000);

const kafkaBrokerHost = process.env.KAFKA_BROKER || 'localhost:9092';

describe('e2e', () => {
  let document: ApiDocument;
  let adapter: KafkaAdapter;
  let producer: Producer;
  const logger: ILogger = {
    log() {},
    error() {},
  };

  beforeAll(async () => {
    const kafka = new Kafka({
      clientId: 'opra-test',
      brokers: [kafkaBrokerHost],
      logLevel: logLevel.NOTHING,
    });

    const admin = kafka.admin();
    await admin.connect();
    for (const topic of ['email-channel-1', 'email-channel-2', 'sms-channel-1', 'sms-channel-2']) {
      try {
        const meta = await admin.fetchTopicMetadata({ topics: [topic] });
        if (meta.topics[0]) {
          await admin.deleteTopicRecords({ topic, partitions: [{ partition: 0, offset: '0' }] });
        }
      } catch {
        //
      }
    }
    await admin.disconnect();

    producer = kafka.producer({
      allowAutoTopicCreation: true,
    });
    await producer.connect();
  });

  beforeAll(async () => {
    document = await TestRpcApiDocument.create();
    adapter = new KafkaAdapter({
      document,
      client: {
        brokers: [kafkaBrokerHost!],
        clientId: 'opra-test',
      },
      logger,
    });
    await adapter.start();
  });

  afterAll(async () => {
    await producer?.disconnect();
    await adapter?.close();
  }, 20000);
  afterAll(() => global.gc && global.gc());

  beforeEach(() => {
    TestController.counters = {
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
    const [ctx1, ctx2] = await Promise.all([
      waitForMessage(adapter, 'mailChannel1', key),
      waitForMessage(adapter, 'mailChannel2', key),
    ]);
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
    expect(TestController.counters).toEqual({
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
    const ctx1 = await waitForMessage(adapter, 'smsChannel2', key);
    expect(ctx1).toBeDefined();
    expect(ctx1?.key).toStrictEqual(key);
    expect(ctx1?.payload).toEqual(payload);
    expect(TestController.counters).toEqual({
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
    const [ctx1, ctx2] = await Promise.all([
      waitForMessage(adapter, 'smsChannel1', key),
      waitForMessage(adapter, 'smsChannel2', key),
    ]);
    expect(ctx1).toBeDefined();
    expect(ctx1?.key).toStrictEqual(key);
    expect(ctx1?.payload).toEqual(payload);
    expect(ctx2).toBeDefined();
    expect(ctx2?.key).toStrictEqual(key);
    expect(ctx2?.payload).toEqual(payload);
    expect(TestController.counters).toEqual({
      mailChannel1: 0,
      mailChannel2: 0,
      smsChannel1: 1,
      smsChannel2: 1,
    });
  });
});
