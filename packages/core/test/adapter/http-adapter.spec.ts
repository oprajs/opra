import supertest from 'supertest';
import { ApiDocument } from '@opra/common';
import { HttpAdapter } from '@opra/core';
import { HttpAdapterHost } from '@opra/core/http/http-adapter.host.js';
import { createTestApi } from '../_support/test-app/index.js';

describe('Http Adapter', function () {

  let api: ApiDocument;
  let adapter: HttpAdapterHost;

  beforeAll(async () => {
    api = await createTestApi();
    adapter = await HttpAdapter.create(api) as HttpAdapterHost;
  });

  afterAll(async () => {
    await adapter.close();
  })

  it('Should call interceptors', async () => {
    const x: any[] = [];
    adapter._interceptors = [
      async () => {
        x.push(1);
      },
      async (ctx, next) => {
        x.push(2);
        await next();
        if (ctx.switchToHttp().outgoing.writableEnded)
          x.push(3);
        else x.push(0);
      }
    ];
    const resp = await supertest(adapter.server).get('/Customers');
    expect(x).toStrictEqual([1, 2, 3]);
    expect(resp.body).toBeDefined();
  })

});

