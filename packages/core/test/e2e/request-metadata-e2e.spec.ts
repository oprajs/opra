import 'reflect-metadata';
import express from 'express';
import request from 'supertest';
import { OpraExpressAdapter, OpraService } from '../../src/index.js';
import { createTestService } from '../_support/test-app/create-service.js';

describe('Requesting Metadata', function () {

  let service: OpraService;
  let app;

  beforeAll(async () => {
    service = await createTestService();
    app = express();
    await OpraExpressAdapter.init(app, service);
  });

  it('Should /$metadata return service metadata', async () => {
    const resp = await request(app).get('/$metadata');
    expect(resp.status).toStrictEqual(200);
    expect(resp.body).toBeDefined();
    expect(resp.body).toMatchObject({
      "@opra:schema": "/$metadata",
      "version": "1.0",
      "info": {
        "title": "TestApi",
        "version": "v1"
      }
    })
  })

  it('Should /$metadata/resources/(Resource) return resource metadata', async () => {
    const resp = await request(app).get('/$metadata/resources/Customers');
    expect(resp.status).toStrictEqual(200);
    expect(resp.body).toBeDefined();
    expect(resp.body).toMatchObject({
      "@opra:schema": "/$metadata/resources/Customers",
      "kind": "EntityResource",
      "type": "Customer",
      "name": "Customers"
    })
  })

  it('Should /(Resource)/$metadata return resource metadata', async () => {
    const resp = await request(app).get('/$metadata/resources/Customers');
    expect(resp.status).toStrictEqual(200);
    expect(resp.body).toBeDefined();
    expect(resp.body).toMatchObject({
      "@opra:schema": "/$metadata/resources/Customers",
      "kind": "EntityResource",
      "type": "Customer",
      "name": "Customers"
    })
  })

  it('Should /$metadata/types/(DataType) return data type metadata', async () => {
    const resp = await request(app).get('/$metadata/types/Address');
    expect(resp.status).toStrictEqual(200);
    expect(resp.body).toBeDefined();
    expect(resp.body).toMatchObject({
      "@opra:schema": "/$metadata/types/Address",
      "kind": "EntityType",
      "name": "Address"
    })
  })

  it('Should throw if url is not acceptable', async () => {
    let resp = await request(app).get('/$metadata/types/Address/id');
    expect(resp.status).toStrictEqual(400);
    resp = await request(app).get('/$metadata/resources/Customers/id');
    expect(resp.status).toStrictEqual(400);
  })

});
