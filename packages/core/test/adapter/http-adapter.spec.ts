import supertest from 'supertest';
import { ApiDocument } from '@opra/common';
import { NodeHttpAdapter } from '@opra/core';
import { NodeHttpAdapterHost } from '@opra/core/http/adapters/node-http-adapter.host';
import { createTestApi } from '../_support/test-app/index.js';

describe('Http Adapter', function () {

  let api: ApiDocument;
  let adapter: NodeHttpAdapterHost;

  beforeAll(async () => {
    api = await createTestApi();
    adapter = await NodeHttpAdapter.create(api) as NodeHttpAdapterHost;
  });

  afterAll(async () => {
    await adapter.close();
  })

  it('Should call interceptors', async () => {
    const x: any[] = [];
    (adapter as any)._interceptors = [
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
    expect(resp.status).toStrictEqual(200);
    expect(x).toStrictEqual([1, 2, 3]);
    expect(resp.body).toBeDefined();
  })

});

