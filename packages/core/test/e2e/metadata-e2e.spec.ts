import express from 'express';
import request from 'supertest';
import { ApiDocument } from '@opra/common';
import { OpraExpressAdapter } from '@opra/core';
import { createTestDocument } from '../_support/test-app/create-document.js';

describe('$metadata', function () {

  let document: ApiDocument;
  let app;

  beforeAll(async () => {
    document = await createTestDocument();
    app = express();
    await OpraExpressAdapter.create(app, document);
  });

  it('Should /$metadata return whole api schema', async () => {
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

  // it('Should /$metadata/resources/(Resource) return resource metadata', async () => {
  //   const resp = await request(app).get('/$metadata/resources/Customers');
  //   expect(resp.status).toStrictEqual(200);
  //   expect(resp.body).toBeDefined();
  //   expect(resp.body).toMatchObject({
  //     "kind": "CollectionResource",
  //     "type": "Customer"
  //   })
  // })
  //
  // it('Should /(Resource)/$metadata return resource metadata', async () => {
  //   const resp = await request(app).get('/$metadata/resources/Customers');
  //   expect(resp.status).toStrictEqual(200);
  //   expect(resp.body).toBeDefined();
  //   expect(resp.body).toMatchObject({
  //     "kind": "CollectionResource",
  //     "type": "Customer"
  //   })
  // })
  //
  // it('Should /$metadata/types/(DataType) return data type metadata', async () => {
  //   const resp = await request(app).get('/$metadata/types/Address');
  //   expect(resp.status).toStrictEqual(200);
  //   expect(resp.body).toBeDefined();
  //   expect(resp.body).toMatchObject({
  //     "kind": "ComplexType"
  //   })
  // })
  //
  // it('Should throw if url is not acceptable', async () => {
  //   let resp = await request(app).get('/$metadata/types/Address/id');
  //   expect(resp.status).toStrictEqual(404);
  //   resp = await request(app).get('/$metadata/resources/Customers/id');
  //   expect(resp.status).toStrictEqual(404);
  // })

});
