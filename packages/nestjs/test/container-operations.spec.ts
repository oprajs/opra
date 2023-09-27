import { Server } from 'http';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ApplicationModule } from './_support/photos-app/app.module.js';

describe('Container operations', function () {

  let server: Server;
  let app: INestApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [ApplicationModule],
    }).compile();

    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    server = app.getHttpServer();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('Should execute action handler', async function () {
    const resp = await request(server)
        .get('/api/svc1/auth/login?user=john');
    expect(resp.body.errors).toStrictEqual(undefined);
    expect(resp.body.data).toStrictEqual({user: 'john'});
    expect(resp.status).toStrictEqual(200);
  });

  it('Should access sub resource', async function () {
    const resp = await request(server)
        .get('/api/svc1/auth/profile');
    expect(resp.body.errors).toStrictEqual(undefined);
    expect(resp.body.data).toStrictEqual({user: 'john'});
    expect(resp.status).toStrictEqual(200);
  });

});
