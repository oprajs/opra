import supertest from 'supertest';
import { ApiDocument } from '@opra/common';
import { HttpAdapter } from '@opra/core';
import { HttpAdapterHost } from '@opra/core/http/http-adapter.host.js';
import { createTestApi } from '../../_support/test-app/index.js';

describe('e2e:metadata', function () {

  let api: ApiDocument;
  let adapter: HttpAdapterHost;

  beforeAll(async () => {
    api = await createTestApi();
    adapter = await HttpAdapter.create(api) as HttpAdapterHost;
  });

  afterAll(async () => {
    await adapter.close();
  })

  it('Should GET / return api schema', async () => {
    const resp = await supertest(adapter.server).get('/');
    expect(resp.status).toStrictEqual(200);
    expect(resp.body).toBeDefined();
    expect(resp.body).toMatchObject(api.exportSchema({webSafe: true}));
  })

});
