import { faker } from '@faker-js/faker';
import { ApiDocument } from '@opra/common';
import { ILogger } from '@opra/core';
import { RabbitmqAdapter } from '@opra/rabbitmq';
import { expect } from 'expect';
import * as rabbit from 'rabbitmq-client';
import { TestController } from './_support/test-api/api/test-controller.js';
import { TestMQApiDocument } from './_support/test-api/index.js';
import { waitForMessage } from './_support/wait-for-message.js';

describe('rabbitmq:RabbitmqAdapter:e2e', () => {
  let document: ApiDocument;
  let adapter: RabbitmqAdapter;
  let connection: rabbit.Connection;
  let publisher: rabbit.Publisher;
  const logger: ILogger = {
    log() {},
    error() {},
  };

  before(async () => {
    connection = new rabbit.Connection(process.env.RABBITMQ_HOST);
    publisher = connection.createPublisher({
      exchanges: [
        { exchange: 'email-channel', type: 'topic' },
        { exchange: 'sms-channel', type: 'topic' },
      ],
    });
    await connection.onConnect(5000);
  });

  before(async () => {
    document = await TestMQApiDocument.create();
    adapter = new RabbitmqAdapter(document, {
      connection: process.env.RABBITMQ_HOST,
      logger,
    });
    await adapter.start();
  });

  after(async () => {
    await publisher?.close();
    await connection?.close();
    await adapter?.close();
  }).timeout(20000);

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
          publisher
            .send(
              {
                routingKey: 'email-channel',
                messageId: key,
                headers: {
                  header1: 'header1-value',
                  header2: '1234',
                },
                contentType: 'application/json',
              },
              {
                ...payload,
                extraField: 12345,
              },
            )
            .then(resolve)
            .catch(reject);
        }, 250);
      }),
    ]);
    expect(ctx1).toBeDefined();
    expect(ctx1?.message.messageId).toStrictEqual(key);
    expect(ctx1?.content).toMatchObject(payload);
    expect(ctx1?.headers).toEqual({
      header1: 'header1-value',
      header2: 1234,
    });
    expect(TestController.counters).toEqual({
      mailChannel: 1,
      smsChannel: 0,
    });
  }).slow(800);
});
