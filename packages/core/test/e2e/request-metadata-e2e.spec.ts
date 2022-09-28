import express from 'express';
import request from 'supertest';
import { OpraService } from '@opra/schema';
import { OpraExpressAdapter } from '../../src/index.js';
import { createTestService } from '../_support/test-app/create-service.js';

describe('Requesting Metadata', function () {

  let service: OpraService;
  let app;

  beforeAll(async () => {
    service = await createTestService();
    app = express();
    await OpraExpressAdapter.init(app, service);
  });

  it('Should /$schema return service metadata', async () => {
    const resp = await request(app).get('/$schema');
    expect(resp.status).toStrictEqual(200);
    expect(resp.body).toBeDefined();
    expect(resp.body).toMatchObject({
      "version": "1.0",
      "info": {
        "title": "TestApi",
        "version": "v1"
      }
    })
    expect(resp.headers['x-opra-schema']).toStrictEqual('http://www.oprajs.com/reference/v1/schema')
  })

  it('Should /$schema/resources/(Resource) return resource metadata', async () => {
    const resp = await request(app).get('/$schema/resources/Customers');
    expect(resp.status).toStrictEqual(200);
    expect(resp.body).toBeDefined();
    expect(resp.body).toMatchObject({
      "kind": "EntityResource",
      "type": "Customer",
      "name": "Customers"
    })
    expect(resp.headers['x-opra-schema']).toStrictEqual('http://www.oprajs.com/reference/v1/schema#EntityResource')
  })

  it('Should /(Resource)/$schema return resource metadata', async () => {
    const resp = await request(app).get('/$schema/resources/Customers');
    expect(resp.status).toStrictEqual(200);
    expect(resp.body).toBeDefined();
    expect(resp.body).toMatchObject({
      "kind": "EntityResource",
      "type": "Customer",
      "name": "Customers"
    })
    expect(resp.headers['x-opra-schema']).toStrictEqual('http://www.oprajs.com/reference/v1/schema#EntityResource')
  })

  it('Should /$schema/types/(DataType) return data type metadata', async () => {
    const resp = await request(app).get('/$schema/types/Address');
    expect(resp.status).toStrictEqual(200);
    expect(resp.body).toBeDefined();
    expect(resp.body).toMatchObject({
      "kind": "ComplexType",
      "name": "Address"
    })
    expect(resp.headers['x-opra-schema']).toStrictEqual('http://www.oprajs.com/reference/v1/schema#ComplexType')
  })

  it('Should throw if url is not acceptable', async () => {
    let resp = await request(app).get('/$schema/types/Address/id');
    expect(resp.status).toStrictEqual(400);
    resp = await request(app).get('/$schema/resources/Customers/id');
    expect(resp.status).toStrictEqual(400);
  })

});
