import { Server } from 'http';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ApplicationModule } from './_support/photos-app/app.module.js';

describe('OpraModule - Guards', function () {

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

  it('Should return error', async function () {
    return request(server)
        .post('/api/svc1/Photos')
        .set('Authorization', 'guard-test')
        .send({id: 100})
        .expect(401, {
          errors: [
            {message: 'Unauthorized', severity: 'error'}
          ]
        });
  });

});
