/* eslint-disable @typescript-eslint/no-non-null-assertion */
import express from 'express';
import supertest from 'supertest';
import { jest } from '@jest/globals'
import { ApiDocument, Singleton } from '@opra/common';
import { ExecutionContext, OpraExpressAdapter } from '@opra/core';
import { createTestDocument } from '../_support/test-app/create-document.js';

describe('e2e:Singleton', function () {

  const app = express();
  const client = supertest(app);
  let document: ApiDocument;
  let adapter: OpraExpressAdapter;
  let resource: Singleton;
  const data = {
    givenName: 'abcd',
    familyName: 'efgh',
  }

  beforeAll(async () => {
    document = await createTestDocument();
    adapter = await OpraExpressAdapter.create(app, document);
    resource = document.getSingleton('bestcustomer');
  });

  afterAll(async () => {
    await adapter.close();
  })

  it('Should execute "create" endpoint', async () => {
    let ctx!: ExecutionContext;
    const mockFn =
        jest.spyOn(resource.operations.create!, 'handler')
            .mockImplementation((c) => ctx = c);
    await client.post('/BestCustomer').send(data);
    expect(ctx).toBeDefined();
    expect(ctx.protocol).toStrictEqual('http');
    expect(ctx.request).toBeDefined();
    expect(ctx.response).toBeDefined();
    expect(ctx.request.operation).toStrictEqual('create');
    expect(ctx.request.args.data).toStrictEqual(data);
    mockFn.mockRestore();
  });

  it('Should execute "get" endpoint', async () => {
    let ctx!: ExecutionContext;
    const mockFn =
        jest.spyOn(resource.operations.get!, 'handler')
            .mockImplementation((c) => ctx = c);
    await client.get('/BestCustomer');
    expect(ctx).toBeDefined();
    expect(ctx.protocol).toStrictEqual('http');
    expect(ctx.request).toBeDefined();
    expect(ctx.response).toBeDefined();
    expect(ctx.request.operation).toStrictEqual('get');
    mockFn.mockRestore();
  });

  it('Should execute "delete" endpoint', async () => {
    let ctx!: ExecutionContext;
    const mockFn =
        jest.spyOn(resource.operations.delete!, 'handler')
            .mockImplementation((c) => ctx = c);
    await client.delete('/BestCustomer');
    expect(ctx).toBeDefined();
    expect(ctx.protocol).toStrictEqual('http');
    expect(ctx.request).toBeDefined();
    expect(ctx.response).toBeDefined();
    expect(ctx.request.operation).toStrictEqual('delete');
    mockFn.mockRestore();
  });

  it('Should execute "update" endpoint', async () => {
    let ctx!: ExecutionContext;
    const mockFn =
        jest.spyOn(resource.operations.update!, 'handler')
            .mockImplementation((c) => ctx = c);
    await client.patch('/BestCustomer').send(data);
    expect(ctx).toBeDefined();
    expect(ctx.protocol).toStrictEqual('http');
    expect(ctx.request).toBeDefined();
    expect(ctx.response).toBeDefined();
    expect(ctx.request.operation).toStrictEqual('update');
    expect(ctx.request.args.data).toStrictEqual(data);
    mockFn.mockRestore();
  });

});
