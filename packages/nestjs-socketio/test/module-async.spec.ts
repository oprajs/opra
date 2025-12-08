// import { faker } from '@faker-js/faker';
// import { INestApplication } from '@nestjs/common';
// import { APP_GUARD, ModuleRef } from '@nestjs/core';
// import { APP_INTERCEPTOR } from '@nestjs/core/constants.js';
// import { Test } from '@nestjs/testing';
// import { RabbitmqAdapter } from '@opra/rabbitmq';
// import { expect } from 'expect';
// import * as rabbit from 'rabbitmq-client';
// import { waitForMessage } from '../../rabbitmq/test/_support/wait-for-message.js';
// import { OpraRabbitmqModule } from '../src/index.js';
// import {
//   Player,
//   Game1Service,
//   Dog,
//   Game2Service,
//   GlobalInterceptor,
//   RabbitmqCatsController,
//   RabbitmqDogsController,
//   TestGlobalGuard,
// } from './_support/test-app/index.js';
//
// const rabbitHost = process.env.RABBITMQ_HOST || 'amqp://localhost:5672';
//
// describe('nestjs-socketio:OpraRabbitmqModule - async', () => {
//   let nestApplication: INestApplication;
//   let moduleRef: ModuleRef;
//   let adapter: RabbitmqAdapter;
//   let connection: rabbit.Connection;
//   let publisher: rabbit.Publisher;
//
//   before(async () => {
//     connection = new rabbit.Connection(process.env.RABBITMQ_HOS);
//     publisher = connection.createPublisher({
//       exchanges: [
//         { exchange: 'email-channel', type: 'topic' },
//         { exchange: 'sms-channel', type: 'topic' },
//         { exchange: 'feed-cat', type: 'topic' },
//         { exchange: 'feed-dog', type: 'topic' },
//       ],
//     });
//     await connection.onConnect(5000);
//   });
//
//   before(async () => {
//     Game1Service.instanceCounter = 0;
//     Game2Service.instanceCounter = 0;
//     const module = await Test.createTestingModule({
//       imports: [
//         OpraRabbitmqModule.forRootAsync({
//           controllers: [RabbitmqCatsController, RabbitmqDogsController],
//           providers: [Game1Service, Game2Service],
//           useFactory: () => ({
//             connection: [rabbitHost],
//             name: 'test',
//             types: [Player, Dog],
//           }),
//         }),
//       ],
//       providers: [
//         {
//           provide: APP_GUARD,
//           useExisting: TestGlobalGuard,
//         },
//         TestGlobalGuard,
//         {
//           provide: APP_INTERCEPTOR,
//           useExisting: GlobalInterceptor,
//         },
//         GlobalInterceptor,
//       ],
//     }).compile();
//
//     nestApplication = module.createNestApplication();
//     await nestApplication.init();
//     moduleRef = nestApplication.get(ModuleRef);
//     adapter = moduleRef.get(RabbitmqAdapter, { strict: false });
//   });
//
//   beforeEach(() => {
//     Game1Service.counters = {
//       getCat: 0,
//       getCats: 0,
//       feedCat: 0,
//     };
//     Game2Service.counters = {
//       getDog: 0,
//       getDogs: 0,
//       feedDog: 0,
//     };
//   });
//
//   after(async () => {
//     await publisher?.close().catch(() => undefined);
//     await connection?.close().catch(() => undefined);
//     await nestApplication?.close().catch(() => undefined);
//   });
//
//   it('Should register adapter', async () => {
//     expect(adapter).toBeDefined();
//     expect(adapter.document).toBeDefined();
//     expect(adapter.document.api).toBeDefined();
//     expect(Array.from(adapter.document.getMqApi().controllers.keys())).toEqual([
//       'Cats',
//       'Dogs',
//     ]);
//   });
//
//   it('Should call DEFAULT scoped api', async () => {
//     const key = faker.string.alpha(5);
//     const payload: Player = {
//       id: faker.number.int(),
//       name: faker.animal.cat(),
//       age: faker.number.int({ max: 12 }),
//     };
//     const [ctx] = await Promise.all([
//       waitForMessage(adapter, 'feedCat', key),
//       new Promise((resolve, reject) => {
//         setTimeout(() => {
//           publisher
//             .send(
//               {
//                 routingKey: 'feed-cat',
//                 messageId: key,
//               },
//               {
//                 ...payload,
//                 extraField: 12345,
//               },
//             )
//             .then(resolve)
//             .catch(reject);
//         }, 250);
//       }),
//     ]);
//     expect(ctx).toBeDefined();
//     expect(ctx?.message.messageId).toStrictEqual(key);
//     expect(ctx?.content).toMatchObject(payload as any);
//     expect(Game1Service.counters).toEqual({
//       getCat: 0,
//       getCats: 0,
//       feedCat: 1,
//     });
//     expect(Game1Service.instanceCounter).toEqual(1);
//   }).slow(800);
//
//   // it('Should call REQUEST scoped api', async () => {
//   //   const instanceCounter1 = HttpDogsController.instanceCounter;
//   //   const instanceCounter2 = DogsService.instanceCounter;
//   //   const r = await request(server).get('/api/v1/dogs');
//   //   expect(r.status).toStrictEqual(200);
//   //   await request(server).get('/api/v1/dogs');
//   //   expect(HttpDogsController.instanceCounter).toEqual(instanceCounter1 + 2);
//   //   expect(DogsService.instanceCounter).toEqual(instanceCounter2 + 2);
//   // });
//   //
//   // it('Should use router guards', async () => {
//   //   const callCounter = AuthGuard.callCounter;
//   //   const r = await request(server).get('/api/v1/cats').set('Authorization', 'reject-auth');
//   //   expect(r.status).toStrictEqual(401);
//   //   expect(AuthGuard.callCounter).toEqual(callCounter + 1);
//   //   expect(AuthGuard.instanceCounter).toEqual(1);
//   //   expect(HttpCatsController.instanceCounter).toEqual(1);
//   // });
//   //
//   // it('Should use global guards', async () => {
//   //   const callCounter = TestGlobalGuard.callCounter;
//   //   const r = await request(server).get('/api/v1/cats').set('Authorization', 'reject-auth');
//   //   expect(r.status).toStrictEqual(401);
//   //   expect(TestGlobalGuard.callCounter).toEqual(callCounter + 1);
//   //   expect(TestGlobalGuard.instanceCounter).toEqual(1);
//   // });
//   //
//   // it('Should use global NextJS interceptors', async () => {
//   //   const callCounter = GlobalInterceptor.callCounter;
//   //   const r = await request(server).get('/api/v1/cats');
//   //   expect(r.status).toStrictEqual(200);
//   //   expect(GlobalInterceptor.callCounter).toEqual(callCounter + 1);
//   //   expect(GlobalInterceptor.instanceCounter).toEqual(1);
//   // });
//   //
//   // it('Should use router NextJS interceptors', async () => {
//   //   const callCounter = TestInterceptor.callCounter;
//   //   const r = await request(server).get('/api/v1/cats');
//   //   expect(r.status).toStrictEqual(200);
//   //   expect(TestInterceptor.callCounter).toEqual(callCounter + 1);
//   //   expect(TestInterceptor.instanceCounter).toEqual(1);
//   // });
//   //
//   // it('Should be able to disable guards for $schema route', async () => {
//   //   const publicCounter = TestGlobalGuard.publicCounter;
//   //   const r = await request(server).get('/api/v1/$schema');
//   //   expect(r.status).toStrictEqual(200);
//   //   expect(TestGlobalGuard.publicCounter).toEqual(publicCounter + 1);
//   // });
// });
