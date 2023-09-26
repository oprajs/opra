/* eslint-disable @typescript-eslint/no-non-null-assertion */
import supertest from 'supertest';
import { ApiDocument } from '@opra/common';
import { NodeHttpAdapter } from '@opra/core';
import { NodeHttpAdapterHost } from '@opra/core/http/adapters/node-http-adapter.host';
import { createTestApi } from '../_support/test-app/index.js';

describe('e2e:Collection', function () {

  let api: ApiDocument;
  let adapter: NodeHttpAdapterHost;

  beforeAll(async () => {
    api = await createTestApi();
    adapter = await NodeHttpAdapter.create(api) as NodeHttpAdapterHost;
  });

  afterAll(async () => {
    await adapter.close();
  })

  it('Should execute "create" endpoint', async () => {
    const resp = await supertest(adapter.server)
        .post('/Customers')
        .send({
          givenName: 'abcd',
          familyName: 'efgh',
          active: 'f'
        });
    expect(resp.type).toStrictEqual('application/opra+json');
    expect(resp.body).toBeDefined();
    expect(resp.body.errors).not.toBeDefined();
    expect(resp.body.context).toStrictEqual('Customers');
    expect(resp.body.operation).toStrictEqual('create');
    expect(resp.body.affected).toStrictEqual(1);
    expect(resp.body.data).toMatchObject({
      _id: /\d+/,
      givenName: /.+/,
      familyName: /.+/,
      active: false
    });
  });

  it('Should execute "get" endpoint', async () => {
    const resp = await supertest(adapter.server).get('/Customers@1');
    expect(resp.type).toStrictEqual('application/opra+json');
    expect(resp.body).toBeDefined();
    expect(resp.body.errors).not.toBeDefined();
    expect(resp.body.context).toStrictEqual('Customers');
    expect(resp.body.operation).toStrictEqual('get');
    expect(resp.body.key).toStrictEqual(1);
    expect(resp.body.data).toMatchObject({
      _id: 1,
      givenName: /.+/,
      familyName: /.+/
    });
  });

  it('Should execute "findMany" endpoint', async () => {
    const resp = await supertest(adapter.server).get('/Customers');
    expect(resp.type).toStrictEqual('application/opra+json');
    expect(resp.body).toBeDefined();
    expect(resp.body.errors).not.toBeDefined();
    expect(resp.body.context).toStrictEqual('Customers');
    expect(resp.body.operation).toStrictEqual('findMany');
    expect(Array.isArray(resp.body.data)).toBeTruthy();
    expect(resp.body.data.length).toBeGreaterThan(0);
    expect(resp.body.data[0]).toMatchObject({
      _id: /\d+/,
      givenName: /.+/,
      familyName: /.+/
    });
  });


  it('Should execute "update" endpoint', async () => {
    const resp = await supertest(adapter.server)
        .patch('/Customers@1')
        .send({
          birthDate: new Date().toISOString(),
          active: 'f'
        });
    expect(resp.type).toStrictEqual('application/opra+json');
    expect(resp.body).toBeDefined();
    expect(resp.body.errors).not.toBeDefined();
    expect(resp.body.context).toStrictEqual('Customers');
    expect(resp.body.operation).toStrictEqual('update');
    expect(resp.body.affected).toStrictEqual(1);
    expect(resp.body.data).toMatchObject({
      _id: /\d+/,
      givenName: /.+/,
      familyName: /.+/,
      birthDate: /^\d{4}-\d{2}-\d{2}/,
      active: false
    });
  });

  it('Should execute "updateMany" endpoint', async () => {
    const resp = await supertest(adapter.server)
        .patch('/Customers')
        .send({
          birthDate: new Date().toISOString()
        });
    expect(resp.type).toStrictEqual('application/opra+json');
    expect(resp.body).toBeDefined();
    expect(resp.body.errors).not.toBeDefined();
    expect(resp.body.context).toStrictEqual('Customers');
    expect(resp.body.operation).toStrictEqual('updateMany');
    expect(resp.body.affected).toBeGreaterThan(0);
  });

  it('Should execute "delete" endpoint', async () => {
    const resp = await supertest(adapter.server).delete('/Customers@10');
    expect(resp.type).toStrictEqual('application/opra+json');
    expect(resp.body).toBeDefined();
    expect(resp.body.errors).not.toBeDefined();
    expect(resp.body.context).toStrictEqual('Customers');
    expect(resp.body.operation).toStrictEqual('delete');
    expect(resp.body.affected).toStrictEqual(1);
  });

  it('Should execute "deleteMany" endpoint', async () => {
    const resp = await supertest(adapter.server).delete('/Customers');
    expect(resp.type).toStrictEqual('application/opra+json');
    expect(resp.body).toBeDefined();
    expect(resp.body.errors).not.toBeDefined();
    expect(resp.body.context).toStrictEqual('Customers');
    expect(resp.body.operation).toStrictEqual('deleteMany');
    expect(resp.body.affected).toBeGreaterThan(0);
  });

});
