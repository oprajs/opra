import { ApiDocument, RpcController, RpcOperation } from '@opra/common';
import { ILogger } from '@opra/core';
import { KafkaAdapter } from '@opra/kafka';
import { TestController } from './_support/test-api/api/test-controller';
import { TestRpcApiDocument } from './_support/test-api/index.js';

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

  afterAll(async () => adapter?.close());
  afterAll(() => global.gc && global.gc());

  it('Should initialize consumers', async () => {
    adapter = new KafkaAdapter({
      client: { brokers: ['localhost'] },
      document,
      logger,
      consumers: {
        'group-1': {
          sessionTimeout: 1000,
        },
      },
    });
    let config: any;
    const originalFn = (adapter as any)._initConsumer;
    jest
      .spyOn(adapter as any, '_initConsumer')
      // @ts-ignore
      .mockImplementation((controller: RpcController, instance: any, operation: RpcOperation) => {
        if (controller.name === 'Mail' && operation.name === 'sendMail') {
          jest.spyOn(adapter.kafka, 'consumer').mockImplementationOnce(cfg => {
            config = cfg;
            return {} as any;
          });
        }
        return originalFn.call(adapter, controller, instance, operation);
      });
    await (adapter as any)._initConsumers();
    expect(config).toBeDefined();
    expect(config).toEqual({
      groupId: 'group-1',
      sessionTimeout: 1000,
    });
  });

  it('Should start consumers', async () => {
    adapter = new KafkaAdapter({
      client: { brokers: ['localhost'] },
      document,
      logger,
    });
    await (adapter as any)._initConsumers();
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
    for (const { consumer, controller, operation } of (adapter as any)._consumers.values()) {
      const x: any = { operation };
      jest.spyOn(consumer, 'connect').mockImplementationOnce(() => {
        x.connectCalled = true;
        return Promise.resolve();
      });
      jest.spyOn(consumer, 'subscribe').mockImplementationOnce(args => {
        x.subscribeCalled = true;
        x.subscribeArgs = args;
        return Promise.resolve();
      });
      jest.spyOn(consumer, 'run').mockImplementationOnce(() => {
        x.runCalled = true;
        return Promise.resolve();
      });
      spys[controller.name + '.' + operation.name] = x;
    }
    await (adapter as any)._start();
    expect(Object.keys(spys)).toEqual(['Mail.sendMail', 'Mail.sendMail2']);
    expect(spys['Mail.sendMail'].connectCalled).toBeTruthy();
    expect(spys['Mail.sendMail'].subscribeCalled).toBeTruthy();
    expect(spys['Mail.sendMail'].runCalled).toBeTruthy();
    expect(spys['Mail.sendMail'].subscribeArgs).toEqual({
      topic: 'test-send-email',
    });
  });

  it('Should call RpcController onInit method while init', async () => {
    adapter = new KafkaAdapter({
      client: { brokers: ['localhost'] },
      document,
      logger,
    });
    await (adapter as any)._initConsumers();
    const instance = adapter.getControllerInstance<TestController>('Mail');
    expect(instance).toBeDefined();
    expect(instance).toBeInstanceOf(TestController);
    expect(instance!.initialized).toEqual(true);
    expect(instance!.closed).toEqual(false);
  });

  it('Should call RpcController onShutdown method while close', async () => {
    adapter = new KafkaAdapter({
      client: { brokers: ['localhost'] },
      document,
      logger,
    });
    await (adapter as any)._initConsumers();
    const instance = adapter.getControllerInstance<TestController>('Mail');
    await adapter.close();
    expect(instance).toBeDefined();
    expect(instance).toBeInstanceOf(TestController);
    expect(instance!.initialized).toEqual(true);
    expect(instance!.closed).toEqual(true);
  });
});
