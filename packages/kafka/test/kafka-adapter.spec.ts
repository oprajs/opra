import { ApiDocument, RpcOperation } from '@opra/common';
import { ILogger } from '@opra/core';
import { KafkaAdapter } from '@opra/kafka';
import { TestRpcApiDocument } from './_support/test-api/index.js';

jest.setTimeout(30000);

describe('KafkaAdapter', () => {
  let document: ApiDocument;
  let adapter: KafkaAdapter;
  const logger: ILogger = {
    log() {},
    error() {},
  };

  beforeAll(async () => {
    document = await TestRpcApiDocument.create();
  });

  afterEach(async () => adapter?.close());
  afterAll(() => global.gc && global.gc());

  it('Should initialize consumers', async () => {
    adapter = new KafkaAdapter({
      client: { brokers: ['localhost'] },
      document,
      logger,
      consumers: {
        'group-1': {
          sessionTimeout: 10000,
        },
      },
    });
    let config: any;
    const originalFn = (adapter as any)._createConsumer;
    jest
      .spyOn(adapter as any, '_createConsumer')
      // @ts-ignore
      .mockImplementation((args: HandlerArguments) => {
        if (args.controller.name === 'Test' && args.operation.name === 'mailChannel1') {
          jest.spyOn(adapter.kafka, 'consumer').mockImplementationOnce(cfg => {
            config = cfg;
            return { disconnect: () => undefined } as any;
          });
        }
        return originalFn.call(adapter, args);
      });
    await (adapter as any)._createAllConsumers();
    expect((adapter as any)._consumers.size).toBeGreaterThan(0);
    expect(config).toBeDefined();
    expect(config).toEqual({
      groupId: 'group-1',
      sessionTimeout: 10000,
    });
  });

  it('Should start consumers', async () => {
    adapter = new KafkaAdapter({
      client: { brokers: ['localhost'] },
      document,
      logger,
    });
    const spys: Record<
      string,
      {
        operation: RpcOperation;
        connectCalled?: boolean;
        subscribeCalled?: boolean;
        subscribeArgs?: any;
        runCalled?: boolean;
      }
    > = {};
    const _createConsumer = (adapter as any)._createConsumer;
    jest.spyOn(adapter as any, '_createConsumer').mockImplementation(async (args: any) => {
      await _createConsumer.call(adapter, args);
      const { operation, consumer, controller } = args;
      const x: any = { operation };
      jest.spyOn(consumer, 'connect').mockImplementationOnce(() => {
        x.connectCalled = true;
        return Promise.resolve();
      });
      jest.spyOn(consumer, 'subscribe').mockImplementationOnce(args2 => {
        x.subscribeCalled = true;
        x.subscribeArgs = args2;
        return Promise.resolve();
      });
      jest.spyOn(consumer, 'run').mockImplementationOnce(() => {
        x.runCalled = true;
        return Promise.resolve();
      });
      spys[controller.name + '.' + operation.name] = x;
    });
    await adapter.start();
    expect(Object.keys(spys)).toEqual([
      'Test.mailChannel1',
      'Test.mailChannel2',
      'Test.smsChannel1',
      'Test.smsChannel2',
    ]);
    expect(spys['Test.mailChannel1'].connectCalled).toBeTruthy();
    expect(spys['Test.mailChannel1'].subscribeCalled).toBeTruthy();
    expect(spys['Test.mailChannel1'].runCalled).toBeTruthy();
    expect(spys['Test.mailChannel1'].subscribeArgs).toEqual({
      topics: ['email-channel-1'],
    });
  });
});
