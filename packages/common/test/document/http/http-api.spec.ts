import { ApiDocument, HttpApi, HttpController, RpcApi } from '@opra/common';
import { TestHttpApiDocument } from '../../_support/test-http-api/index.js';

describe('HttpApi', () => {
  let doc: ApiDocument;
  afterAll(() => global.gc && global.gc());

  beforeAll(async () => {
    doc = await TestHttpApiDocument.create();
  });

  it('Should create HttpApi instance', async () => {
    const api = doc.api as HttpApi;
    expect(api).toBeDefined();
    expect(api.transport).toEqual('http');
    expect(api.description).toEqual('test service');
    expect(api.url).toEqual('/test');
  });

  it('Should create controller instances', async () => {
    const api = doc.api as RpcApi;
    expect(api.controllers.size).toBeGreaterThan(0);
    expect(Array.from(api.controllers.keys())).toStrictEqual(['Auth', 'Countries', 'Country', 'Customers', 'Customer']);
    expect(api.controllers.get('Customers')).toBeInstanceOf(HttpController);
  });
});
