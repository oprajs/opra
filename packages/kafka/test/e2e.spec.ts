import { faker } from '@faker-js/faker';
import { ApiDocument } from '@opra/common';
import { ILogger } from '@opra/core';
import { KafkaAdapter, KafkaContext } from '@opra/kafka';
import { Producer } from 'kafkajs';
import { AsyncEventEmitter } from 'node-events-async';
import { MailController } from './_support/test-msg-api/api/mail-controller.js';
import { TestMsgApiDocument } from './_support/test-msg-api/index.js';

const broker = process.env.KAFKA_BROKER || 'localhost:9092';

describe('e2e', () => {
  let document: ApiDocument;
  let adapter: KafkaAdapter;
  let producer: Producer;
  const logger: ILogger = {
    log() {},
    error() {},
  };

  beforeAll(async () => {
    if (!process.env.KAFKA_BROKER) return;
    document = await TestMsgApiDocument.create();
    adapter = new KafkaAdapter({
      document,
      brokers: [broker],
      logger,
      clientId: 'opra-test',
    });
    producer = adapter.kafka.producer({
      allowAutoTopicCreation: true,
    });
    await producer.connect();
  });

  afterAll(async () => {
    await producer?.disconnect();
    await adapter?.close();
  }, 20000);
  afterAll(() => global.gc && global.gc());

  if (!process.env.KAFKA_BROKER) {
    it('KAFKA_BROKER environment not set', async () => {
      //
    });
    return;
  }

  it('Should receive message', async () => {
    await adapter.start();
    const inst = adapter.getControllerInstance<MailController>('Mail')!;
    const emitter = new AsyncEventEmitter();
    let ctx: KafkaContext | undefined;
    const spy = jest.spyOn(inst, 'sendMail').mockImplementation((_ctx: KafkaContext) => {
      ctx = _ctx;
      emitter.emit('resolve');
      return 'OK';
    });
    const key = faker.string.alpha();
    const payload = {
      from: faker.internet.email(),
      to: faker.internet.email(),
      message: faker.string.alpha(),
    };
    await new Promise((resolve, reject) => {
      adapter.on('error', reject);
      emitter.on('resolve', resolve);
      setTimeout(() => {
        producer
          .send({
            topic: 'test-send-email',
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
          .catch(reject);
      }, 1000);
    });
    expect(ctx).toBeDefined();
    expect(ctx?.key).toStrictEqual(key);
    expect(ctx?.payload).toEqual(payload);
    expect(ctx?.headers).toEqual({
      header1: 'header1-value',
      header2: 1234,
    });
    spy.mockRestore();
  });
});
