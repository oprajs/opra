import { ApiDocument } from '@opra/common';
import { ILogger } from '@opra/core';
import { KafkaAdapter } from '@opra/kafka';
import { expect } from 'expect';
import { Kafka } from 'kafkajs';
import * as sinon from 'sinon';
import { TestRpcApiDocument } from './_support/test-api/index.js';

describe('kafka:KafkaAdapter', () => {
  let document: ApiDocument;
  let adapter: KafkaAdapter;
  const logger: ILogger = {
    log() {},
    error() {},
  };

  before(async () => {
    document = await TestRpcApiDocument.create();
  });

  afterEach(async () => adapter?.close());
  afterEach(() => sinon.restore());

  it('Should initialize consumers', async () => {
    adapter = new KafkaAdapter(document, {
      client: { brokers: ['localhost'] },
      logger,
      consumers: {
        'group-1': {
          sessionTimeout: 10000,
        },
      },
    });
    const configs: any[] = [];
    sinon.stub(Kafka.prototype, 'consumer').callsFake(cfg => {
      configs.push(cfg);
      return { disconnect: () => undefined } as any;
    });
    await adapter.initialize();
    expect((adapter as any)._consumers.size).toBeGreaterThan(0);
    expect(configs.length).toEqual(2);
    expect(configs[0]).toEqual({
      groupId: 'group-1',
      sessionTimeout: 10000,
    });
  });

  it('Should start consumers', async () => {
    adapter = new KafkaAdapter(document, {
      client: { brokers: ['localhost'] },
      logger,
    });
    const _createConsumer = (adapter as any)._createConsumer;
    const stubbedConsumers = new WeakSet();
    let connectCount = 0;
    let subscribeCount = 0;
    let runCount = 0;
    sinon
      .stub(adapter as any, '_createConsumer')
      .callsFake(async (args: any) => {
        await _createConsumer.call(adapter, args);
        const { consumer } = args;
        if (stubbedConsumers.has(consumer)) return;
        stubbedConsumers.add(consumer);
        sinon.stub(consumer, 'connect').callsFake(() => {
          connectCount++;
          return Promise.resolve();
        });
        sinon.stub(consumer, 'subscribe').callsFake(() => {
          subscribeCount++;
          return Promise.resolve();
        });
        sinon.stub(consumer, 'run').callsFake(() => {
          runCount++;
          return Promise.resolve();
        });
      });
    await adapter.initialize();
    await adapter.start();
    expect(connectCount).toEqual(1);
    expect(subscribeCount).toEqual(4);
    expect(runCount).toEqual(1);
  });
});
