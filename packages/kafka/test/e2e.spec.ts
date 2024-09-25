import { faker } from '@faker-js/faker';
import { ApiDocument } from '@opra/common';
import { ILogger } from '@opra/core';
import { KafkaAdapter, KafkaContext } from '@opra/kafka';
import { Producer } from 'kafkajs';
import { AsyncEventEmitter } from 'node-events-async';
import { MailController } from './_support/test-api/api/mail-controller.js';
import { TestRpcApiDocument } from './_support/test-api/index.js';

const broker = process.env.KAFKA_BROKER;
const describeIf = (condition: boolean) => (condition ? describe : describe.skip);

describeIf(!!broker)('e2e', () => {
  let document: ApiDocument;
  let adapter: KafkaAdapter;
  let producer: Producer;
  const logger: ILogger = {
    log() {},
    error() {},
  };

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
