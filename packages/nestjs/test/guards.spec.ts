import { Server } from 'http';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ApplicationModule } from './_support/photos-app/app.module.js';
import { TestGlobalGuard } from './_support/photos-app/guards/global.guard.js';
import { LogCounterInterceptor } from './_support/photos-app/guards/log-counter.interceptor.js';

describe('OpraModule - Guards', function () {

  let server: Server;
  let app: INestApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [ApplicationModule],
    }).compile();

    app = module.createNestApplication({logger: []});
    app.setGlobalPrefix('api');
    server = app.getHttpServer();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('Should use per-function guards', async function () {
    const r = await request(server)
        .post('/api/svc1/Photos')
        .set('Authorization', 'reject-auth')
        .send({id: 100});
    expect(r.status).toStrictEqual(401);
    expect(r.body).toStrictEqual({
      errors: [
        {
          code: 'UnauthorizedException',
          message: 'Unauthorized',
          severity: 'error',
          stack: expect.anything()
        }
      ]
    })
  });

  it('Should use global guards', async function () {
    await request(server)
        .post('/api/svc1/Photos')
        .set('Authorization', 'reject-auth')
        .send({id: 100});
    expect(TestGlobalGuard.counter).toBeGreaterThan(0);
  });

  it('Should use global interceptors', async function () {
    const i = LogCounterInterceptor.logCount;
    await request(server)
        .get('/api/svc1/Photos');
    expect(LogCounterInterceptor.logCount).toEqual(i + 1);
  });

});

