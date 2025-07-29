import { faker } from '@faker-js/faker';
import { ApiDocument } from '@opra/common';
import { ILogger } from '@opra/core';
import { KafkaAdapter } from '@opra/kafka';
import { expect } from 'expect';
import { Kafka, logLevel, Producer } from 'kafkajs';
import { TestController } from './_support/test-api/api/test-controller.js';
import { TestRpcApiDocument } from './_support/test-api/index.js';
import { waitForMessage } from './_support/wait-for-message.js';

const kafkaBrokerHost = process.env.KAFKA_BROKER || 'localhost:9092';

describe('kafka:e2e', () => {
  let document: ApiDocument;
  let adapter: KafkaAdapter;
  let producer: Producer;
  const logger: ILogger = {
    log() {},
    error() {},
  };

  before(async () => {
    const kafka = new Kafka({
      clientId: 'opra-test',
      brokers: [kafkaBrokerHost],
      logLevel: logLevel.NOTHING,
    });
    producer = kafka.producer({
      allowAutoTopicCreation: true,
    });
    await producer.connect();
  });

  before(async () => {
    document = await TestRpcApiDocument.create();
    adapter = new KafkaAdapter(document, {
      client: {
        brokers: [kafkaBrokerHost!],
        clientId: 'opra-test',
      },
      logger,
    });
    await adapter.start();
  });

  after(async function () {
    this.timeout(20000);
    await producer?.disconnect();
    await adapter?.close();
  });

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
    const [ctx1, ctx2] = await Promise.all([
      waitForMessage(adapter, 'mailChannel1', key),
      waitForMessage(adapter, 'mailChannel2', key),
      new Promise((resolve, reject) => {
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
            .then(resolve)
            .catch(reject);
        }, 250);
      }),
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
  }).slow(800);

  it('Should listen regexp channel', async () => {
    const key = faker.string.alpha(5);
    const payload = {
      from: faker.internet.email(),
      to: faker.internet.email(),
      message: faker.string.alpha(5),
    };
    const [ctx1] = await Promise.all([
      waitForMessage(adapter, 'smsChannel2', key),
      new Promise((resolve, reject) => {
        setTimeout(() => {
          producer
            .send({
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
            })
            .then(resolve)
            .catch(reject);
        }, 250);
      }),
    ]);
    expect(ctx1).toBeDefined();
    expect(ctx1?.key).toStrictEqual(key);
    expect(ctx1?.payload).toEqual(payload);
    expect(TestController.counters).toEqual({
      mailChannel1: 0,
      mailChannel2: 0,
      smsChannel1: 0,
      smsChannel2: 1,
    });
  }).slow(800);

  it('Should receive message from same groupId', async () => {
    const key = faker.string.alpha(5);
    const payload = {
      from: faker.internet.email(),
      to: faker.internet.email(),
      message: faker.string.alpha(5),
    };
    const [ctx1, ctx2] = await Promise.all([
      waitForMessage(adapter, 'smsChannel1', key),
      waitForMessage(adapter, 'smsChannel2', key),
      new Promise((resolve, reject) => {
        setTimeout(() => {
          producer
            .send({
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
            })
            .then(resolve)
            .catch(reject);
        }, 250);
      }),
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
  }).slow(800);
});
