import { faker } from '@faker-js/faker';
import { ApiDocument } from '@opra/common';
import { ILogger } from '@opra/core';
import { RabbitmqAdapter } from '@opra/rabbitmq';
import amqplib from 'amqplib';
import { TestController } from './_support/test-api/api/test-controller.js';
import { TestRpcApiDocument } from './_support/test-api/index.js';
import { waitForMessage } from './_support/wait-for-message.js';

// set timeout to be longer (especially for the after hook)
jest.setTimeout(30000);

const rabbitHost = process.env.RABBITMQ_HOST || 'amqp://localhost:5672';

describe('e2e', () => {
  let document: ApiDocument;
  let adapter: RabbitmqAdapter;
  let connection: amqplib.Connection;
  let channel: amqplib.Channel;
  const logger: ILogger = {
    log() {},
    error() {},
  };

  beforeAll(async () => {
    connection = await amqplib.connect(rabbitHost);
    channel = await connection.createChannel();
    await channel.assertQueue('email-channel', { durable: true });
    await channel.assertQueue('sms-channel', { durable: true });
  });

  beforeAll(async () => {
    document = await TestRpcApiDocument.create();
    adapter = new RabbitmqAdapter(document, {
      connection: [rabbitHost],
      logger,
    });
    await adapter.start();
  });

  afterAll(async () => {
    await connection?.close();
    await adapter?.close();
  }, 20000);
  afterAll(() => global.gc && global.gc());

  beforeEach(() => {
    TestController.counters = {
      mailChannel: 0,
      smsChannel: 0,
    };
  });

  it('Should receive message', async () => {
    const key = faker.string.alpha(5);
    const payload = {
      from: faker.internet.email(),
      to: faker.internet.email(),
      message: faker.string.alpha(5),
    };
    const [ctx1] = await Promise.all([
      waitForMessage(adapter, 'mailChannel', key),
      new Promise((resolve, reject) => {
        setTimeout(() => {
          try {
            const b = channel.sendToQueue(
              'email-channel',
              Buffer.from(
                JSON.stringify({
                  ...payload,
                  extraField: 12345,
                }),
              ),
              {
                messageId: key,
                headers: {
                  header1: 'header1-value',
                  header2: '1234',
                },
                contentType: 'application/json',
              },
            );
            if (b) resolve(true);
            else reject(new Error('Failed to send message'));
          } catch (e) {
            reject(e);
          }
        }, 250);
      }),
    ]);
    expect(ctx1).toBeDefined();
    expect(ctx1?.properties.messageId).toStrictEqual(key);
    expect(ctx1?.content).toMatchObject(payload);
    expect(ctx1?.headers).toEqual({
      header1: 'header1-value',
      header2: 1234,
    });
    expect(TestController.counters).toEqual({
      mailChannel: 1,
      smsChannel: 0,
    });
  });
});
