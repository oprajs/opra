import supertest from 'supertest';
import { ApiDocument } from '@opra/common';
import { NodeHttpAdapter } from '@opra/core';
import { NodeHttpAdapterHost } from '@opra/core/http/adapters/node-http-adapter.host';
import { createTestApi } from '../_support/test-app/index.js';

describe('e2e:metadata', function () {

  let api: ApiDocument;
  let adapter: NodeHttpAdapterHost;

  beforeAll(async () => {
    api = await createTestApi();
    adapter = await NodeHttpAdapter.create(api) as NodeHttpAdapterHost;
  });

  afterAll(async () => adapter.close());
  afterAll(() => global.gc && global.gc());

  it('Should GET / return api schema', async () => {
    const resp = await supertest(adapter.server).get('/');
    expect(resp.body).toBeDefined();
    expect(resp.body).toMatchObject(api.exportSchema({webSafe: true}));
    expect(resp.status).toStrictEqual(200);
  })

});
