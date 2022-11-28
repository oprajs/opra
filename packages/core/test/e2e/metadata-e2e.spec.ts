import express from 'express';
import request from 'supertest';
import { OpraDocument } from '@opra/schema';
import { OpraExpressAdapter } from '../../src/index.js';
import { createTestDocument } from '../_support/test-app/create-document.js';

describe('Metadata', function () {

  let service: OpraDocument;
  let app;

  beforeAll(async () => {
    service = await createTestDocument();
    app = express();
    await OpraExpressAdapter.init(app, service);
  });

  it('Should /$metadata return service schema', async () => {
    const resp = await request(app).get('/$metadata');
    expect(resp.status).toStrictEqual(200);
    expect(resp.body).toBeDefined();
    expect(resp.body).toMatchObject({
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
      "kind": "CollectionResource",
      "type": "Customer"
    })
  })

  it('Should /(Resource)/$metadata return resource metadata', async () => {
    const resp = await request(app).get('/$metadata/resources/Customers');
    expect(resp.status).toStrictEqual(200);
    expect(resp.body).toBeDefined();
    expect(resp.body).toMatchObject({
      "kind": "CollectionResource",
      "type": "Customer"
    })
  })

  it('Should /$metadata/types/(DataType) return data type metadata', async () => {
    const resp = await request(app).get('/$metadata/types/Address');
    expect(resp.status).toStrictEqual(200);
    expect(resp.body).toBeDefined();
    expect(resp.body).toMatchObject({
      "kind": "ComplexType"
    })
  })

  it('Should throw if url is not acceptable', async () => {
    let resp = await request(app).get('/$metadata/types/Address/id');
    expect(resp.status).toStrictEqual(404);
    resp = await request(app).get('/$metadata/resources/Customers/id');
    expect(resp.status).toStrictEqual(404);
  })

});
