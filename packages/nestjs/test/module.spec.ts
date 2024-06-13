import { Server } from 'http';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { OpraNestAdapter } from '@opra/nestjs';
import { ApplicationModule } from './_support/customer-app/app.module.js';

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

  it('Should register OpraNestAdapter', async function () {
    const adapter = moduleRef.get(OpraNestAdapter, { strict: false });
    expect(adapter).toBeDefined();
    expect(adapter.document).toBeDefined();
    expect(adapter.controllers.length).toBeGreaterThan(0);
  });

  it('Should return query result', async function () {
    const r = await request(server).get('/api/svc1/Customers@1');
    expect(r.body.errors).toStrictEqual(undefined);
    expect(r.status).toStrictEqual(200);
    expect(r.body.payload).toBeDefined();
    expect(r.body.payload._id).toEqual(1);
  });
});
