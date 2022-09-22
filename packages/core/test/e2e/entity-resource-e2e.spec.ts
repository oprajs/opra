import 'reflect-metadata';
import express from 'express';
import request from 'supertest';
import { OpraExpressAdapter, OpraService } from '../../src/index.js';
import { createTestService } from '../_support/test-app/create-service.js';

describe('Entity Resource Operations', function () {

  let service: OpraService;
  let app;

  beforeAll(async () => {
    service = await createTestService();
    app = express();
    await OpraExpressAdapter.init(app, service);
  });

  it('Should request "get" operations', async () => {
    const resp = await request(app).get('/Customers@1');
    expect(resp.status).toStrictEqual(200);
    expect(resp.body).toBeDefined();
    expect(resp.body).toMatchObject({
      "@opra:metadata": "/$metadata",
      "version": "1.0",
      "info": {
        "title": "TestApi",
        "version": "v1"
      }
    })
  })

});
