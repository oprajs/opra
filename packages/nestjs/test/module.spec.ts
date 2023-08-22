import { Server } from 'http';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { OpraModuleRef } from '@opra/nestjs';
import { ApplicationModule } from './_support/photos-app/app.module.js';
import photosData from './_support/photos-app/photos-module/photos.data.js';

describe('OpraModule', function () {

  let server: Server;
  let app: INestApplication;
  let moduleRef: ModuleRef;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [ApplicationModule],
    }).compile();

    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    server = app.getHttpServer();
    await app.init();
    moduleRef = app.get(ModuleRef);
  });

  afterEach(async () => {
    await app.close();
  });

  it('Should register resources', async function () {
    const opraModuleRef = moduleRef.get(OpraModuleRef, {strict: false});
    expect(opraModuleRef).toBeDefined();
    expect(opraModuleRef.adapter).toBeDefined();
    expect(opraModuleRef.api).toBeDefined();
    expect(opraModuleRef.options).toBeDefined();
    expect(opraModuleRef.api.getCollection('Photos')).toBeDefined();
    expect(opraModuleRef.api.getStorage('PhotoStorage')).toBeDefined();
  })

  it('Should return query result', async function () {
    const r = await request(server)
        .get('/api/svc1/Photos@1');
    expect(r.body.errors).toStrictEqual(undefined);
    expect(r.status).toStrictEqual(200);
    expect(r.body.data).toStrictEqual(photosData[0]);
  });

});
