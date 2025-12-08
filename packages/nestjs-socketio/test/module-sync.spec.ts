import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { APP_GUARD, ModuleRef } from '@nestjs/core';
import { APP_INTERCEPTOR } from '@nestjs/core/constants.js';
import { Test } from '@nestjs/testing';
import { SocketioAdapter } from '@opra/socketio';
import { expect } from 'expect';
import * as socketiocl from 'socket.io-client';
import { OpraSocketioModule } from '../src/index.js';
import {
  Game1Controller,
  Game1Service,
  Game2Controller,
  Game2Service,
  GlobalInterceptor,
  Player,
  TestGlobalGuard,
} from './_support/test-app/index.js';

describe('nestjs-socketio:OpraSocketioModule - sync', () => {
  let nestApplication: INestApplication;
  let moduleRef: ModuleRef;
  let adapter: SocketioAdapter;
  let client: socketiocl.Socket;

  before(async () => {
    Game1Service.instanceCounter = 0;
    Game2Service.instanceCounter = 0;
    const module = await Test.createTestingModule({
      imports: [
        OpraSocketioModule.forRoot({
          name: 'test',
          controllers: [Game1Controller, Game2Controller],
          providers: [Game1Service, Game2Service],
          types: [Player],
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
    adapter = moduleRef.get(SocketioAdapter, { strict: false });
    const httpServer = nestApplication.getHttpServer();
    httpServer.listen();
    const port = (httpServer.address() as any).port;
    client = socketiocl.io('ws://localhost:' + port);
  });

  beforeEach(() => {
    Game1Service.counters = {
      getPlayers: 0,
      addPlayer: 0,
      pingAll: 0,
    };
    Game2Service.counters = {
      getPlayers: 0,
      addPlayer: 0,
      pingAll: 0,
    };
  });

  after(async () => {
    client?.close();
    await nestApplication?.close().catch(() => undefined);
  });

  it('Should register adapter', async () => {
    expect(adapter).toBeDefined();
    expect(adapter.document).toBeDefined();
    expect(adapter.document.api).toBeDefined();
    expect(Array.from(adapter.document.getWsApi().controllers.keys())).toEqual([
      'Game1',
      'Game2',
    ]);
  });

  it('Should call DEFAULT scoped api', async () => {
    const payload: Player = {
      id: faker.number.int(),
      name: faker.animal.cat(),
      age: 20,
    };
    const ack = JSON.parse(
      await client.emitWithAck('game1-add-player', payload),
    );
    expect(ack).toBeDefined();
    expect(ack).toEqual(payload);
    expect(Game1Service.counters).toEqual({
      getPlayers: 0,
      addPlayer: 1,
      pingAll: 0,
    });
    expect(Game1Service.instanceCounter).toEqual(1);
  }).slow(800);

  // it('Should call REQUEST scoped api', async () => {
  //   const key = faker.string.alpha(5);
  //   const payload: Dog = {
  //     id: faker.number.int(),
  //     name: faker.animal.dog(),
  //     age: faker.number.int({ max: 12 }),
  //   };
  //   await producer.send({
  //     topic: 'feed-dog',
  //     messages: [
  //       {
  //         key,
  //         value: JSON.stringify(payload),
  //       },
  //     ],
  //   });
  //   const ctx = await waitForMessage(adapter.adapter, 'feedDog', key);
  //   expect(ctx).toBeDefined();
  //   expect(ctx?.key).toStrictEqual(key);
  //   expect(ctx?.payload).toEqual(payload);
  //   expect(DogsService.counters).toEqual({
  //     getDog: 0,
  //     getDogs: 0,
  //     feedDog: 1,
  //   });
  //   expect(DogsService.instanceCounter).toEqual(1);
  // });

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
