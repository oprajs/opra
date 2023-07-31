import supertest from 'supertest';
import { ApiDocument } from '@opra/common';
import { OpraHttpAdapter } from '@opra/core';
import { createTestApi } from '../_support/test-app/index.js';

describe('e2e:$metadata', function () {

  let document: ApiDocument;
  let adapter: OpraHttpAdapter;

  beforeAll(async () => {
    document = await createTestApi();
    adapter = await OpraHttpAdapter.create(document);
  });

  it('Should /$metadata return whole api schema', async () => {
    const resp = await supertest(adapter.server).get('/$metadata');
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
