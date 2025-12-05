import { ApiDocument } from '@opra/common';
import { HttpIncoming, NodeIncomingMessage } from '@opra/http';
import { SQBAdapter } from '@opra/sqb';
import { op } from '@sqb/builder';
import { CustomerApplication } from 'example-express-sqb';
import { expect } from 'expect';
import { createContext } from '../_support/create-context.js';

describe('sqb:SQBAdapter.parseRequest', () => {
  let app: CustomerApplication;
  let document: ApiDocument;

  before(async () => {
    app = await CustomerApplication.create();
    document = app.document;
  });

  it('Should parse "create" request', async () => {
    const data = { _id: 1001 };
    const dataStr = JSON.stringify(data);
    const operation = document
      .getHttpApi()
      .findOperation('Customers', 'create');
    const context = createContext(
      app.adapter,
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
    context.queryParams.projection = 'givenName,gender';

    const o = await SQBAdapter.parseRequest(context);
    expect(o.method).toStrictEqual('create');
    expect(o.data).toEqual(data);
    expect(o.options).toEqual({
      projection: 'givenName,gender',
    });
  });

  it('Should parse "delete" request', async () => {
    const operation = document.getHttpApi().findOperation('Customer', 'delete');
    expect(operation).toBeDefined();
    const context = createContext(app.adapter, operation);
    context.pathParams.customerId = 1;

    const o = await SQBAdapter.parseRequest(context);
    expect(o.method).toStrictEqual('delete');
    expect(o.key).toStrictEqual(1);
  });

  it('Should parse "deleteMany" request', async () => {
    const operation = document
      .getHttpApi()
      .findOperation('Customers', 'deleteMany');
    expect(operation).toBeDefined();
    const context = createContext(app.adapter, operation);
    context.queryParams.filter = '_id>5';

    const o = await SQBAdapter.parseRequest(context);
    expect(o.method).toStrictEqual('deleteMany');
    expect(o.options).toEqual({
      filter: op.gt('_id', 5),
    });
  });

  it('Should parse "get" request', async () => {
    const operation = document.getHttpApi().findOperation('Customer', 'get');
    expect(operation).toBeDefined();
    const context = createContext(app.adapter, operation);
    context.pathParams.customerId = 1;
    context.queryParams.projection = 'givenName,gender';

    const o = await SQBAdapter.parseRequest(context);
    expect(o.method).toStrictEqual('get');
    expect(o.key).toStrictEqual(1);
    expect(o.options).toEqual({
      projection: 'givenName,gender',
    });
  });

  it('Should parse "findMany" request', async () => {
    const operation = document
      .getHttpApi()
      .findOperation('Customers', 'findMany');
    expect(operation).toBeDefined();
    const context = createContext(app.adapter, operation);
    context.queryParams.projection = 'givenName,gender';
    context.queryParams.filter = '_id>5';
    context.queryParams.limit = 10;
    context.queryParams.skip = 1;
    context.queryParams.count = true;
    context.queryParams.sort = 'sort';

    const o = await SQBAdapter.parseRequest(context);
    expect(o.method).toStrictEqual('findMany');
    expect(o.options).toEqual({
      projection: 'givenName,gender',
      filter: op.gt('_id', 5),
      limit: 10,
      skip: 1,
      count: true,
      sort: 'sort',
    });
  });

  it('Should parse "update" request', async () => {
    const operation = document.getHttpApi().findOperation('Customer', 'update');
    expect(operation).toBeDefined();
    const data = { _id: 1001 };
    const dataStr = JSON.stringify(data);
    const context = createContext(
      app.adapter,
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
    context.pathParams.customerId = 1;
    context.queryParams.projection = 'givenName,gender';

    const o = await SQBAdapter.parseRequest(context);
    expect(o.method).toStrictEqual('update');
    expect(o.data).toEqual(data);
    expect(o.key).toStrictEqual(1);
    expect(o.options).toEqual({
      projection: 'givenName,gender',
    });
  });

  it('Should parse "updateMany" request', async () => {
    const operation = document
      .getHttpApi()
      .findOperation('Customers', 'updateMany');
    expect(operation).toBeDefined();
    const data = { _id: 1001 };
    const dataStr = JSON.stringify(data);
    const context = createContext(
      app.adapter,
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
    context.queryParams.filter = '_id>5';

    const o = await SQBAdapter.parseRequest(context);
    expect(o.method).toStrictEqual('updateMany');
    expect(o.data).toEqual(data);
    expect(o.options).toEqual({
      filter: op.gt('_id', 5),
    });
  });
});
