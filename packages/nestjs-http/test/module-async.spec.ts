import { INestApplication } from '@nestjs/common';
import { APP_GUARD, ModuleRef } from '@nestjs/core';
import { APP_INTERCEPTOR } from '@nestjs/core/constants.js';
import { Test } from '@nestjs/testing';
import { Server } from 'http';
import request from 'supertest';
import { OpraHttpModule, OpraHttpNestjsAdapter } from '../src/index.js';
import {
  AuthGuard,
  Cat,
  CatsService,
  Dog,
  DogsService,
  GlobalInterceptor,
  HttpCatsController,
  HttpDogsController,
  TestGlobalGuard,
  TestInterceptor,
} from './_support/test-app/index.js';

describe('OpraModule - async', () => {
  let nestApplication: INestApplication;
  let moduleRef: ModuleRef;
  let server: Server;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        OpraHttpModule.forRootAsync({
          controllers: [HttpCatsController, HttpDogsController],
          providers: [CatsService, DogsService],
          basePath: 'v1',
          schemaIsPublic: true,
          useFactory: () => ({
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
    nestApplication.setGlobalPrefix('api');
    server = nestApplication.getHttpServer();
    await nestApplication.init();
    moduleRef = nestApplication.get(ModuleRef);
  });

  afterAll(async () => {
    await nestApplication.close();
  });

  it('Should register adapter', async () => {
    const adapter = moduleRef.get(OpraHttpNestjsAdapter, { strict: false });
    expect(adapter).toBeDefined();
    expect(adapter.nestControllers.length).toBeGreaterThan(0);
    expect(adapter.document).toBeDefined();
    expect(adapter.document.api).toBeDefined();
    expect(Array.from(adapter.document.httpApi.controllers.keys())).toEqual([
      'Cats',
      'Dogs',
    ]);
  });

  it('Should call DEFAULT scoped api', async () => {
    const r = await request(server).get('/api/v1/cats');
    expect(r.status).toStrictEqual(200);
    await request(server).get('/api/v1/cats');
    expect(HttpCatsController.instanceCounter).toEqual(1);
    expect(CatsService.instanceCounter).toEqual(1);
  });

  it('Should call REQUEST scoped api', async () => {
    const instanceCounter1 = HttpDogsController.instanceCounter;
    const instanceCounter2 = DogsService.instanceCounter;
    const r = await request(server).get('/api/v1/dogs');
    expect(r.status).toStrictEqual(200);
    await request(server).get('/api/v1/dogs');
    expect(HttpDogsController.instanceCounter).toEqual(instanceCounter1 + 2);
    expect(DogsService.instanceCounter).toEqual(instanceCounter2 + 2);
  });

  it('Should use router guards', async () => {
    const callCounter = AuthGuard.callCounter;
    const r = await request(server)
      .get('/api/v1/cats')
      .set('Authorization', 'reject-auth');
    expect(r.status).toStrictEqual(401);
    expect(AuthGuard.callCounter).toEqual(callCounter + 1);
    expect(AuthGuard.instanceCounter).toEqual(1);
    expect(HttpCatsController.instanceCounter).toEqual(1);
  });

  it('Should use global guards', async () => {
    const callCounter = TestGlobalGuard.callCounter;
    const r = await request(server)
      .get('/api/v1/cats')
      .set('Authorization', 'reject-auth');
    expect(r.status).toStrictEqual(401);
    expect(TestGlobalGuard.callCounter).toEqual(callCounter + 1);
    expect(TestGlobalGuard.instanceCounter).toEqual(1);
  });

  it('Should use global NextJS interceptors', async () => {
    const callCounter = GlobalInterceptor.callCounter;
    const r = await request(server).get('/api/v1/cats');
    expect(r.status).toStrictEqual(200);
    expect(GlobalInterceptor.callCounter).toEqual(callCounter + 1);
    expect(GlobalInterceptor.instanceCounter).toEqual(1);
  });

  it('Should use router NextJS interceptors', async () => {
    const callCounter = TestInterceptor.callCounter;
    const r = await request(server).get('/api/v1/cats');
    expect(r.status).toStrictEqual(200);
    expect(TestInterceptor.callCounter).toEqual(callCounter + 1);
    expect(TestInterceptor.instanceCounter).toEqual(1);
  });

  it('Should be able to disable guards for $schema route', async () => {
    const publicCounter = TestGlobalGuard.publicCounter;
    const r = await request(server).get('/api/v1/$schema');
    expect(r.status).toStrictEqual(200);
    expect(TestGlobalGuard.publicCounter).toEqual(publicCounter + 1);
  });
});
