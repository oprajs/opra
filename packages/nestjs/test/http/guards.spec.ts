import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Server } from 'http';
import request from 'supertest';
import { TestGlobalGuard } from '../_support/http-customer-app/guards/global.guard.js';
import { LogCounterInterceptor } from '../_support/http-customer-app/guards/log-counter.interceptor.js';
import { TestModule } from '../_support/http-customer-app/test.module.js';

describe('OpraModule - Guards', () => {
  let server: Server;
  let app: INestApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [TestModule],
    }).compile();

    app = module.createNestApplication({ logger: [] });
    app.setGlobalPrefix('api');
    server = app.getHttpServer();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('Should use per-function guards', async () => {
    const r = await request(server).post('/api/auth/MyProfile').set('Authorization', 'reject-auth').send({ id: 100 });
    expect(r.status).toStrictEqual(401);
    expect(r.body).toStrictEqual({
      errors: [
        {
          code: 'UnauthorizedException',
          message: 'Unauthorized',
          severity: 'error',
        },
      ],
    });
  });

  it('Should use global guards', async () => {
    const counter = TestGlobalGuard.counter;
    await request(server).post('/api/auth/MyProfile').set('Authorization', 'reject-auth').send({ id: 100 });
    expect(TestGlobalGuard.counter).toEqual(counter + 1);
  });

  it('Should use global NextJS interceptors', async () => {
    const logCount = LogCounterInterceptor.logCount;
    await request(server).get('/api/auth/MyProfile');
    expect(LogCounterInterceptor.logCount).toEqual(logCount + 1);
  });

  it('Should be able to disable guards for $schema route', async () => {
    const counter = TestGlobalGuard.counter;
    const publicCounter = TestGlobalGuard.publicCounter;
    await request(server).get('/api/$schema');
    expect(TestGlobalGuard.counter).toEqual(counter);
    expect(TestGlobalGuard.publicCounter).toEqual(publicCounter + 1);
  });
});
