import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { APP_GUARD, ModuleRef } from '@nestjs/core';
import { APP_INTERCEPTOR } from '@nestjs/core/constants.js';
import { Test } from '@nestjs/testing';
import { OpraRabbitmqModule } from '@opra/nestjs';
import { RabbitmqAdapter } from '@opra/rabbitmq';
import { waitForMessage } from '@opra/rabbitmq/test/_support/wait-for-message';
import amqplib from 'amqplib';
import { CatsService } from '../_support/test-app/cats.service.js';
import { DogsService } from '../_support/test-app/dogs.service.js';
import { Cat } from '../_support/test-app/models/cat.js';
import { Dog } from '../_support/test-app/models/dog.js';
import { TestGlobalGuard } from '../_support/test-app/providers/global.guard.js';
import { GlobalInterceptor } from '../_support/test-app/providers/global.interceptor.js';
import { RabbitmqCatsController } from '../_support/test-app/rabbitmq/rabbitmq-cats-controller.js';
import { RabbitmqDogsController } from '../_support/test-app/rabbitmq/rabbitmq-dogs-controller.js';

// set timeout to be longer (especially for the after hook)
jest.setTimeout(30000);

const rabbitHost = process.env.RABBITMQ_HOST || 'amqp://localhost:5672';

describe('OpraRabbitmqModule - async', () => {
  let nestApplication: INestApplication;
  let moduleRef: ModuleRef;
  let adapter: RabbitmqAdapter;
  let connection: amqplib.Connection;
  let channel: amqplib.Channel;

  beforeAll(async () => {
    connection = await amqplib.connect(rabbitHost);
    channel = await connection.createChannel();
    await channel.assertQueue('email-channel', { durable: true });
    await channel.assertQueue('sms-channel', { durable: true });
  });

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        OpraRabbitmqModule.forRootAsync({
          controllers: [RabbitmqCatsController, RabbitmqDogsController],
          providers: [CatsService, DogsService],
          useFactory: () => ({
            connection: [rabbitHost],
            name: 'test',
            types: [Cat, Dog],
          }),
        }),
      ],
      providers: [
        {
          provide: APP_GUARD,
          useExisting: TestGlobalGuard,
        },
        TestGlobalGuard,
        {
          provide: APP_INTERCEPTOR,
          useExisting: GlobalInterceptor,
        },
        GlobalInterceptor,
      ],
    }).compile();

    nestApplication = module.createNestApplication();
    await nestApplication.init();
    moduleRef = nestApplication.get(ModuleRef);
    adapter = moduleRef.get(RabbitmqAdapter, { strict: false });
  });

  beforeEach(() => {
    CatsService.counters = {
      getCat: 0,
      getCats: 0,
      feedCat: 0,
    };
    DogsService.counters = {
      getDog: 0,
      getDogs: 0,
      feedDog: 0,
    };
  });

  afterAll(async () => {
    await connection?.close().catch(() => undefined);
    await nestApplication?.close().catch(() => undefined);
  });

  it('Should register adapter', async () => {
    expect(adapter).toBeDefined();
    expect(adapter.document).toBeDefined();
    expect(adapter.document.api).toBeDefined();
    expect(Array.from(adapter.document.rpcApi.controllers.keys())).toEqual([
      'Cats',
      'Dogs',
    ]);
  });

  it('Should call DEFAULT scoped api', async () => {
    const key = faker.string.alpha(5);
    const payload: Cat = {
      id: faker.number.int(),
      name: faker.animal.cat(),
      age: faker.number.int({ max: 12 }),
    };
    const [ctx] = await Promise.all([
      waitForMessage(adapter, 'feedCat', key),
      new Promise((resolve, reject) => {
        setTimeout(() => {
          const b = channel.sendToQueue(
            'feed-cat',
            Buffer.from(
              JSON.stringify({
                ...payload,
                extraField: 12345,
              }),
            ),
            {
              messageId: key,
              contentType: 'application/json',
            },
          );
          if (b) resolve(true);
          else reject(new Error('Failed to send message'));
        }, 250);
      }),
    ]);
    expect(ctx).toBeDefined();
    expect(ctx?.properties.messageId).toStrictEqual(key);
    expect(ctx?.content).toMatchObject(payload);
    expect(CatsService.counters).toEqual({
      getCat: 0,
      getCats: 0,
      feedCat: 1,
    });
    expect(CatsService.instanceCounter).toEqual(1);
  });

  // it('Should call REQUEST scoped api', async () => {
  //   const instanceCounter1 = HttpDogsController.instanceCounter;
  //   const instanceCounter2 = DogsService.instanceCounter;
  //   const r = await request(server).get('/api/v1/dogs');
  //   expect(r.status).toStrictEqual(200);
  //   await request(server).get('/api/v1/dogs');
  //   expect(HttpDogsController.instanceCounter).toEqual(instanceCounter1 + 2);
  //   expect(DogsService.instanceCounter).toEqual(instanceCounter2 + 2);
  // });
  //
  // it('Should use router guards', async () => {
  //   const callCounter = AuthGuard.callCounter;
  //   const r = await request(server).get('/api/v1/cats').set('Authorization', 'reject-auth');
  //   expect(r.status).toStrictEqual(401);
  //   expect(AuthGuard.callCounter).toEqual(callCounter + 1);
  //   expect(AuthGuard.instanceCounter).toEqual(1);
  //   expect(HttpCatsController.instanceCounter).toEqual(1);
  // });
  //
  // it('Should use global guards', async () => {
  //   const callCounter = TestGlobalGuard.callCounter;
  //   const r = await request(server).get('/api/v1/cats').set('Authorization', 'reject-auth');
  //   expect(r.status).toStrictEqual(401);
  //   expect(TestGlobalGuard.callCounter).toEqual(callCounter + 1);
  //   expect(TestGlobalGuard.instanceCounter).toEqual(1);
  // });
  //
  // it('Should use global NextJS interceptors', async () => {
  //   const callCounter = GlobalInterceptor.callCounter;
  //   const r = await request(server).get('/api/v1/cats');
  //   expect(r.status).toStrictEqual(200);
  //   expect(GlobalInterceptor.callCounter).toEqual(callCounter + 1);
  //   expect(GlobalInterceptor.instanceCounter).toEqual(1);
  // });
  //
  // it('Should use router NextJS interceptors', async () => {
  //   const callCounter = TestInterceptor.callCounter;
  //   const r = await request(server).get('/api/v1/cats');
  //   expect(r.status).toStrictEqual(200);
  //   expect(TestInterceptor.callCounter).toEqual(callCounter + 1);
  //   expect(TestInterceptor.instanceCounter).toEqual(1);
  // });
  //
  // it('Should be able to disable guards for $schema route', async () => {
  //   const publicCounter = TestGlobalGuard.publicCounter;
  //   const r = await request(server).get('/api/v1/$schema');
  //   expect(r.status).toStrictEqual(200);
  //   expect(TestGlobalGuard.publicCounter).toEqual(publicCounter + 1);
  // });
});
