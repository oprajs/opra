import { ApiDocument } from '@opra/common';
import { HttpIncoming, NodeIncomingMessage } from '@opra/core';
import { SQBAdapter } from '@opra/sqb';
import { TestApp } from '../_support/test-app/index.js';

describe('SQBAdapter.parseRequest', function () {
  let app: TestApp;
  let document: ApiDocument;

  beforeAll(async () => {
    app = await TestApp.create();
    document = app.document;
  });

  it('Should parse "create" request', async () => {
    const data = { _id: 1001 };
    const dataStr = JSON.stringify(data);
    const operation = document.api?.findOperation('Customers', 'create');
    const context = app.createContext(
      operation,
      HttpIncoming.from(
        await NodeIncomingMessage.fromAsync(
          [
            'POST /Customers HTTP/1.1',
            'Content-Type: application/json',
            'Transfer-Encoding: chunked',
            '',
            dataStr.length.toString(16),
            dataStr,
            '0',
            '',
          ].join('\r\n'),
        ),
      ),
    );
    context.queryParams.projection = 'projection';

    const o = await SQBAdapter.parseRequest(context);
    expect(o.method).toStrictEqual('create');
    expect(o.data).toEqual(data);
    expect(o.options).toStrictEqual({
      projection: 'projection',
    });
  });

  it('Should parse "delete" request', async () => {
    const operation = document.api?.findOperation('Customers', 'delete');
    const context = app.createContext(operation);
    context.pathParams._id = 1;

    const o = await SQBAdapter.parseRequest(context);
    expect(o.method).toStrictEqual('delete');
    expect(o.key).toStrictEqual(1);
  });

  it('Should parse "deleteMany" request', async () => {
    const operation = document.api?.findOperation('Customers', 'deleteMany');
    const context = app.createContext(operation);
    context.queryParams.filter = 'filter';

    const o = await SQBAdapter.parseRequest(context);
    expect(o.method).toStrictEqual('deleteMany');
    expect(o.options).toStrictEqual({
      filter: 'filter',
    });
  });

  it('Should parse "get" request', async () => {
    const operation = document.api?.findOperation('Customers', 'get');
    const context = app.createContext(operation);
    context.pathParams._id = 1;
    context.queryParams.projection = 'projection';

    const o = await SQBAdapter.parseRequest(context);
    expect(o.method).toStrictEqual('get');
    expect(o.key).toStrictEqual(1);
    expect(o.options).toStrictEqual({
      projection: 'projection',
    });
  });

  it('Should parse "findMany" request', async () => {
    const operation = document.api?.findOperation('Customers', 'findMany');
    const context = app.createContext(operation);
    context.queryParams.projection = 'projection';
    context.queryParams.filter = 'filter';
    context.queryParams.limit = 10;
    context.queryParams.skip = 1;
    context.queryParams.count = true;
    context.queryParams.sort = 'sort';

    const o = await SQBAdapter.parseRequest(context);
    expect(o.method).toStrictEqual('findMany');
    expect(o.options).toStrictEqual({
      projection: 'projection',
      filter: 'filter',
      limit: 10,
      skip: 1,
      count: true,
      sort: 'sort',
    });
  });

  it('Should parse "update" request', async () => {
    const data = { _id: 1001 };
    const dataStr = JSON.stringify(data);
    const operation = document.api?.findOperation('Customers', 'update');
    const context = app.createContext(
      operation,
      HttpIncoming.from(
        await NodeIncomingMessage.fromAsync(
          [
            'PATCH /Customers HTTP/1.1',
            'Content-Type: application/json',
            'Transfer-Encoding: chunked',
            '',
            dataStr.length.toString(16),
            dataStr,
            '0',
            '',
          ].join('\r\n'),
        ),
      ),
    );
    context.pathParams._id = 1;
    context.queryParams.projection = 'projection';

    const o = await SQBAdapter.parseRequest(context);
    expect(o.method).toStrictEqual('update');
    expect(o.data).toEqual(data);
    expect(o.key).toStrictEqual(1);
    expect(o.options).toStrictEqual({
      projection: 'projection',
    });
  });

  it('Should parse "updateMany" request', async () => {
    const data = { _id: 1001 };
    const dataStr = JSON.stringify(data);
    const operation = document.api?.findOperation('Customers', 'updateMany');
    const context = app.createContext(
      operation,
      HttpIncoming.from(
        await NodeIncomingMessage.fromAsync(
          [
            'PATCH /Customers HTTP/1.1',
            'Content-Type: application/json',
            'Transfer-Encoding: chunked',
            '',
            dataStr.length.toString(16),
            dataStr,
            '0',
            '',
          ].join('\r\n'),
        ),
      ),
    );
    context.queryParams.filter = 'filter';

    const o = await SQBAdapter.parseRequest(context);
    expect(o.method).toStrictEqual('updateMany');
    expect(o.data).toEqual(data);
    expect(o.options).toStrictEqual({
      filter: 'filter',
    });
  });
});
