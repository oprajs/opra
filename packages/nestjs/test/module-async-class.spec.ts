import { Server } from 'http';
import request from 'supertest';
import { INestApplication, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { OpraModule, OpraModuleOptions, OpraModuleOptionsFactory } from '../src/index.js';
import config from './_support/photos-app/config.js';
import photosData from './_support/photos-app/photos-module/photos.data.js';
import { Service1RootModule } from './_support/photos-app/service-root.module.js';

class ConfigService implements OpraModuleOptionsFactory {
  createOptions(): OpraModuleOptions {
    return {
      ...config,
      basePath: 'svc1',
    };
  }
}

@Module({
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {
}


@Module({
  imports: [OpraModule.forRootAsync({
    imports: [Service1RootModule, ConfigModule],
    useExisting: ConfigService,
  })],
})
export class AsyncApplicationModule {
}

describe('OpraModule (async existing)', function () {

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
    expect(r.body.data).toStrictEqual(photosData[0]);
  });

});
