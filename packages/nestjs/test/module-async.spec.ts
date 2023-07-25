import { Server } from 'http';
import request from 'supertest';
import { INestApplication, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { OpraModule } from '../src/index.js';
import config from './_support/photos-app/config.js';
import photosData from './_support/photos-app/photos-module/photos.data.js';
import { Service1RootModule } from './_support/photos-app/service-root.module.js';

@Module({
  imports: [OpraModule.forRootAsync({
    imports: [Service1RootModule],
    useFactory: async () => {
      return {
        ...config,
        basePath: 'svc1',
      }
    }
  })],
})
export class AsyncApplicationModule {
}

describe('OpraModule (async configuration)', function () {

  let server: Server;
  let app: INestApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AsyncApplicationModule],
    }).compile();

    app = module.createNestApplication();
    server = app.getHttpServer();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('Should return query result', async function () {
    const r = await request(server)
        .get('/svc1/Photos@1');
    expect(r.status).toStrictEqual(200);
    expect(r.body).toStrictEqual(photosData[0]);
  });

});
