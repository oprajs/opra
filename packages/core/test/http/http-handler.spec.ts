import { ApiDocument, HttpOperation } from '@opra/common';
import { ExpressAdapter, HttpIncoming, HttpOutgoing } from '@opra/core';
import { kHandler } from '@opra/core/constants';
import { HttpContext } from '@opra/core/http/http-context';
import { HttpHandler } from '@opra/core/http/impl/http-handler';
import cookieParser from 'cookie-parser';
import express, { Express } from 'express';
import supertest from 'supertest';
import { createTestApi } from '../_support/test-api/index.js';

describe('HttpHandler', () => {
  let document: ApiDocument;
  let app: Express;
  let adapter: ExpressAdapter;
  let httpHandler: HttpHandler;

  function createContext(operation: HttpOperation, request: HttpIncoming) {
    const response = HttpOutgoing.from({ req: request });
    return new HttpContext({
      adapter,
      operation,
      controller: operation.owner,
      platform: 'express',
      request,
      response,
    });
  }

  beforeAll(async () => {
    document = await createTestApi();
    app = express();
    app.use(cookieParser());
    adapter = new ExpressAdapter(app, document);
    httpHandler = adapter[kHandler];
  });

  afterAll(async () => adapter.close());
  afterAll(() => global.gc && global.gc());

  it('Should parse query parameters', async () => {
    const resource = document.api?.findController('Customers');
    const operation = resource!.operations.get('findMany')!;
    const context = createContext(
      operation,
      HttpIncoming.from({
        method: 'GET',
        url: '/Customers?limit=5&xyz=1',
      }),
    );
    await httpHandler.parseRequest(context);
    expect(context.queryParams.limit).toEqual(5);
    expect(context.queryParams.xyz).not.toBeDefined();
  });

  it('Should parse path parameters', async () => {
    const resource = document.api?.findController('Customer/CustomerAddress');
    const operation = resource!.operations.get('get')!;
    const context = createContext(
      operation,
      HttpIncoming.from({
        method: 'GET',
        params: { customerId: '123', addressId: '456' },
      }),
    );
    await httpHandler.parseRequest(context);
    expect(context.pathParams.customerId).toEqual(123);
    expect(context.pathParams.addressId).toEqual(456);
  });

  it('Should parse cookie parameters', async () => {
    const resource = document.api?.findController('Customer');
    const operation = resource!.operations.get('get')!;
    const context = createContext(
      operation,
      HttpIncoming.from({
        method: 'GET',
        cookies: { accessToken: 'gWEGnjkwegew', cid: '123', other: 'xyz' },
      }),
    );
    await httpHandler.parseRequest(context);
    expect(context.cookies.accessToken).toEqual('gWEGnjkwegew');
    expect(context.cookies.cid).toEqual(123);
    expect(context.cookies.other).not.toBeDefined();
  });

  it('Should parse header parameters', async () => {
    const resource = document.api?.findController('Customer');
    const operation = resource!.operations.get('get')!;
    const context = createContext(
      operation,
      HttpIncoming.from({
        method: 'GET',
        headers: { accessToken: 'gWEGnjkwegew', cid: '123', other: 'xyz' },
      }),
    );
    await httpHandler.parseRequest(context);
    expect(context.headers.accessToken).toEqual('gWEGnjkwegew');
    expect(context.headers.cid).toEqual(123);
    expect(context.headers.other).not.toBeDefined();
  });

  it('Should validate parameters', async () => {
    const resource = document.api?.findController('Customers');
    const operation = resource!.operations.get('findMany')!;
    const context = createContext(
      operation,
      HttpIncoming.from({
        method: 'GET',
        url: '/Customers?limit=abc',
      }),
    );
    await expect(() => httpHandler.parseRequest(context)).rejects.toThrow('Invalid parameter');
  });

  it('Should parse content-type', async () => {
    const resource = document.api?.findController('Customers');
    const operation = resource!.operations.get('create')!;
    const context = createContext(
      operation,
      HttpIncoming.from({
        method: 'GET',
        headers: { 'content-type': 'application/json; charset=UTF-8' },
      }),
    );
    await httpHandler.parseRequest(context);
    expect(context.mediaType).toBeDefined();
    expect(context.mediaType?.contentType).toEqual('application/json');
    expect(context.mediaType?.contentEncoding).toEqual('utf-8');
  });

  it('Should throw if content-type does not matches', async () => {
    const resource = document.api?.findController('Customers');
    const operation = resource!.operations.get('create')!;
    const context = createContext(
      operation,
      HttpIncoming.from({
        method: 'GET',
        headers: { 'content-type': 'text/plain; charset=UTF-8' },
      }),
    );
    await expect(() => httpHandler.parseRequest(context)).rejects.toThrow('should be one of required content types');
  });

  it('Should call interceptors', async () => {
    const x: any[] = [];
    adapter.interceptors = [
      async (ctx: HttpContext, next) => {
        x.push(1);
        return next();
      },
      async (ctx: HttpContext, next) => {
        x.push(2);
        await next();
        if (ctx.response.writableEnded) x.push(3);
        else x.push(0);
      },
    ];
    const resp = await supertest(app).get('/Customers');
    expect(resp.status).toStrictEqual(200);
    expect(x).toStrictEqual([1, 2, 3]);
    expect(resp.body).toBeDefined();
  });
});
