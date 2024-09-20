import { ApiDocument, MsgController, MsgOperation } from '@opra/common';
import { ILogger } from '@opra/core';
import { KafkaAdapter } from '@opra/kafka';
import { MailController } from './_support/test-msg-api/api/mail-controller.js';
import { TestMsgApiDocument } from './_support/test-msg-api/index.js';

describe('KafkaAdapter', () => {
  let document: ApiDocument;
  let adapter: KafkaAdapter;
  const logger: ILogger = {
    log() {},
    error() {},
  };

  beforeAll(async () => {
    document = await TestMsgApiDocument.create();
  });

  afterAll(async () => adapter?.close());
  afterAll(() => global.gc && global.gc());

  it('Should initialize consumers', async () => {
    adapter = new KafkaAdapter({ document, brokers: ['localhost'], logger });
    let config: any;
    const originalFn = (adapter as any)._initConsumer;
    jest
      .spyOn(adapter as any, '_initConsumer')
      // @ts-ignore
      .mockImplementation((controller: MsgController, instance: any, operation: MsgOperation) => {
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
    });
  });

  it('Should start consumers', async () => {
    adapter = new KafkaAdapter({ document, brokers: ['localhost'], logger });
    await (adapter as any)._initConsumers();
    const spys: Record<
      string,
      {
        operation: MsgOperation;
        connectCalled?: boolean;
        subscribeCalled?: boolean;
        subscribeArgs?: any;
        runCalled?: boolean;
      }
    > = {};
    for (const [consumer, { controller, operation }] of (adapter as any)._consumers.entries()) {
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

  it('Should call MsgController onInit method while init', async () => {
    adapter = new KafkaAdapter({ document, brokers: ['localhost'], logger });
    await (adapter as any)._initConsumers();
    const instance = adapter.getControllerInstance<MailController>('Mail');
    expect(instance).toBeDefined();
    expect(instance).toBeInstanceOf(MailController);
    expect(instance!.initialized).toEqual(true);
    expect(instance!.closed).toEqual(false);
  });

  it('Should call MsgController onShutdown method while close', async () => {
    adapter = new KafkaAdapter({ document, brokers: ['localhost'], logger });
    await (adapter as any)._initConsumers();
    const instance = adapter.getControllerInstance<MailController>('Mail');
    await adapter.close();
    expect(instance).toBeDefined();
    expect(instance).toBeInstanceOf(MailController);
    expect(instance!.initialized).toEqual(true);
    expect(instance!.closed).toEqual(true);
  });
});
