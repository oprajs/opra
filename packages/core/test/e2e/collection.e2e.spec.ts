/* eslint-disable @typescript-eslint/no-non-null-assertion */
import supertest from 'supertest';
import { ApiDocument } from '@opra/common';
import { HttpAdapter } from '@opra/core';
import { HttpAdapterHost } from '@opra/core/adapter/http/http-adapter.host.js';
import { createTestApi } from '../_support/test-app/index.js';

describe('e2e:Collection', function () {

  let api: ApiDocument;
  let adapter: HttpAdapterHost;

  beforeAll(async () => {
    api = await createTestApi();
    adapter = await HttpAdapter.create(api) as HttpAdapterHost;
  });

  afterAll(async () => {
    await adapter.close();
  })

  it('Should execute "create" operation', async () => {
    const resp = await supertest(adapter.server)
        .post('/Customers')
        .send({
          givenName: 'abcd',
          familyName: 'efgh',
          active: 'f'
        });
    expect(resp.type).toStrictEqual('application/json');
    expect(resp.body).toBeDefined();
    expect(resp.body.errors).not.toBeDefined();
    expect(resp.body).toMatchObject({
      resource: 'Customers',
      operation: 'create',
      affected: 1,
    });
    expect(resp.body.data).toMatchObject({
      _id: /\d+/,
      givenName: /.+/,
      familyName: /.+/,
      active: false
    });
  });

  it('Should execute "get" operation', async () => {
    const resp = await supertest(adapter.server).get('/Customers@1');
    expect(resp.type).toStrictEqual('application/json');
    expect(resp.body).toBeDefined();
    expect(resp.body.errors).not.toBeDefined();
    expect(resp.body).toMatchObject({
      resource: 'Customers',
      operation: 'get'
    });
    expect(resp.body.data).toMatchObject({
      _id: 1,
      givenName: /.+/,
      familyName: /.+/
    });
  });

  it('Should execute "findMany" operation', async () => {
    const resp = await supertest(adapter.server).get('/Customers');
    expect(resp.type).toStrictEqual('application/json');
    expect(resp.body).toBeDefined();
    expect(resp.body.errors).not.toBeDefined();
    expect(resp.body).toMatchObject({
      resource: 'Customers',
      operation: 'findMany'
    });
    expect(Array.isArray(resp.body.data)).toBeTruthy();
    expect(resp.body.data.length).toBeGreaterThan(0);
    expect(resp.body.data[0]).toMatchObject({
      _id: /\d+/,
      givenName: /.+/,
      familyName: /.+/
    });
  });



  it('Should execute "update" operation', async () => {
    const resp = await supertest(adapter.server)
        .patch('/Customers@1')
        .send({
          birthDate: new Date().toISOString(),
          active: 'f'
        });
    expect(resp.type).toStrictEqual('application/json');
    expect(resp.body).toBeDefined();
    expect(resp.body.errors).not.toBeDefined();
    expect(resp.body).toMatchObject({
      affected: 1,
      operation: 'update'
    });
    expect(resp.body.data).toMatchObject({
      _id: /\d+/,
      givenName: /.+/,
      familyName: /.+/,
      birthDate: /^\d{4}-\d{2}-\d{2}/,
      active: false
    });
  });

  it('Should execute "updateMany" operation', async () => {
    const resp = await supertest(adapter.server)
        .patch('/Customers')
        .send({
          birthDate: new Date().toISOString()
        });
    expect(resp.type).toStrictEqual('application/json');
    expect(resp.body).toBeDefined();
    expect(resp.body.errors).not.toBeDefined();
    expect(resp.body).toMatchObject({
      affected: /\d+/,
      operation: 'updateMany'
    });
  });

  it('Should execute "delete" operation', async () => {
    const resp = await supertest(adapter.server).delete('/Customers@99');
    expect(resp.type).toStrictEqual('application/json');
    expect(resp.body).toBeDefined();
    expect(resp.body.errors).not.toBeDefined();
    expect(resp.body).toMatchObject({
      affected: 1,
      operation: 'delete'
    });
  });

  it('Should execute "deleteMany" operation', async () => {
    const resp = await supertest(adapter.server).delete('/Customers');
    expect(resp.type).toStrictEqual('application/json');
    expect(resp.body).toBeDefined();
    expect(resp.body.errors).not.toBeDefined();
    expect(resp.body).toMatchObject({
      affected: /\d+/,
      operation: 'deleteMany'
    });
  });

});
