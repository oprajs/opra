import express from 'express';
import request from 'supertest';
import { ApiDocument } from '@opra/common';
import { OpraExpressAdapter } from '@opra/core';
import { createTestApi } from '../_support/test-app/index.js';

describe('e2e:$metadata', function () {

  let document: ApiDocument;
  let app;

  beforeAll(async () => {
    document = await createTestApi();
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

});
