import { Readable } from 'node:stream';
import type { INestApplication } from '@nestjs/common';
import { APP_GUARD, ModuleRef } from '@nestjs/core';
import { APP_INTERCEPTOR } from '@nestjs/core/constants.js';
import { Test } from '@nestjs/testing';
import { expect } from 'expect';
import { Server } from 'http';
import MultipartStream from 'multipart-stream';
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

describe('nestjs-http:OpraModule - sync', () => {
  let nestApplication: INestApplication;
  let moduleRef: ModuleRef;
  let server: Server;

  before(async () => {
    TestGlobalGuard.publicCounter = 0;
    TestGlobalGuard.callCounter = 0;
    TestGlobalGuard.instanceCounter = 0;
    AuthGuard.callCounter = 0;
    AuthGuard.instanceCounter = 0;
    HttpCatsController.instanceCounter = 0;
    GlobalInterceptor.callCounter = 0;
    GlobalInterceptor.instanceCounter = 0;
    TestInterceptor.callCounter = 0;
    TestInterceptor.instanceCounter = 0;
    HttpCatsController.instanceCounter = 0;
    CatsService.instanceCounter = 0;
    const module = await Test.createTestingModule({
      imports: [
        OpraHttpModule.forRoot({
          name: 'test',
          controllers: [HttpCatsController, HttpDogsController],
          providers: [CatsService, DogsService],
          types: [Cat, Dog],
          basePath: 'v1',
          schemaIsPublic: true,
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

  after(() => nestApplication.close());

  it('Should register adapter', async () => {
    const adapter = moduleRef.get(OpraHttpNestjsAdapter, { strict: false });
    expect(adapter).toBeDefined();
    expect(adapter.nestControllers.length).toBeGreaterThan(0);
    expect(adapter.document).toBeDefined();
    expect(adapter.document.api).toBeDefined();
    expect(
      Array.from(adapter.document.getHttpApi().controllers.keys()),
    ).toEqual(['Cats', 'Dogs']);
  });

  it('Should call DEFAULT scoped api', async () => {
    const r = await request(server).get('/api/v1/cats');
    expect(r.status).toStrictEqual(200);
    await request(server).get('/api/v1/cats');
    expect(HttpCatsController.instanceCounter).toEqual(1);
    expect(CatsService.instanceCounter).toEqual(1);
  }).slow(800);

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

  it('Should POST:/$bundle send requests to controllers and return multipart response', async () => {
    const makeRawRequest = (method: string, path: string): Readable =>
      Readable.from([
        Buffer.from(
          `${method} ${path} HTTP/1.1\r\nHost: localhost\r\n\r\n`,
          'utf-8',
        ),
      ]);

    const requestStream = new MultipartStream();
    requestStream.addPart({
      headers: {
        'Content-Disposition': 'form-data; name="req"; filename="request"',
        'Content-Type': 'application/http',
        'X-Request-Id': '1',
      },
      body: makeRawRequest('GET', '/api/v1/cats'),
    });
    requestStream.addPart({
      headers: {
        'Content-Disposition': 'form-data; name="req"; filename="request"',
        'Content-Type': 'application/http',
        'X-Request-Id': '2',
      },
      body: makeRawRequest('GET', '/api/v1/dogs'),
    });

    const chunks: Buffer[] = [];
    for await (const chunk of requestStream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as any));
    }
    const body = Buffer.concat(chunks);

    const resp = await request(server)
      .post('/api/v1/$bundle')
      .set(
        'Content-Type',
        `multipart/mixed; boundary=${requestStream.boundary}`,
      )
      .parse((res, callback) => {
        const _chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer | string) => {
          _chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });
        res.on('end', () => callback(null, Buffer.concat(_chunks)));
      })
      .send(body);

    const responseText = Buffer.isBuffer(resp.body)
      ? resp.body.toString('utf-8')
      : '';

    expect(resp.status).toStrictEqual(200);
    expect(resp.headers['content-type']).toMatch(/multipart\/mixed/);

    const responseBoundary =
      resp.headers['content-type'].match(/boundary=([^\s;]+)/)?.[1];
    expect(responseBoundary).toBeDefined();

    const parts = responseText
      .split(`--${responseBoundary}`)
      .filter(p => p && p !== '--\r\n' && p.trim() !== '--');
    expect(parts.length).toBe(2);

    expect(parts[0]).toMatch(/Content-Type:\s*application\/http/i);
    expect(parts[0]).toMatch(/X-Request-Id:\s*1/i);
    expect(parts[0]).toMatch(/HTTP\/1\.1\s+\d{3}/);

    expect(parts[1]).toMatch(/Content-Type:\s*application\/http/i);
    expect(parts[1]).toMatch(/X-Request-Id:\s*2/i);
    expect(parts[1]).toMatch(/HTTP\/1\.1\s+\d{3}/);
  });
});
