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

  afterAll(async () => adapter.close());
  afterAll(() => global.gc && global.gc());

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
    expect(resp.statusCode).toStrictEqual(201);
    expect(resp.body.context).toStrictEqual('/Customers');
    expect(resp.body.contextUrl).toMatch(/\/#\/root\/resources\/Customers$/);
    expect(resp.body.type).toStrictEqual('Customer');
    expect(resp.body.typeUrl).toMatch(/\/#\/types\/Customer$/);
    expect(resp.body.affected).toStrictEqual(1);
    expect(resp.body.payload).toMatchObject({
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
    expect(resp.statusCode).toStrictEqual(200);
    expect(resp.body.context).toStrictEqual('/Customers');
    expect(resp.body.contextUrl).toMatch(/\/#\/root\/resources\/Customers$/);
    expect(resp.body.type).toStrictEqual('Customer');
    expect(resp.body.typeUrl).toMatch(/\/#\/types\/Customer$/);
    expect(resp.body.payload).toMatchObject({
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
    expect(resp.statusCode).toStrictEqual(200);
    expect(resp.body.context).toStrictEqual('/Customers');
    expect(resp.body.contextUrl).toMatch(/\/#\/root\/resources\/Customers$/);
    expect(resp.body.type).toStrictEqual('Customer');
    expect(resp.body.typeUrl).toMatch(/\/#\/types\/Customer$/);
    expect(resp.body.count).toStrictEqual(10);
    expect(resp.body.totalMatches).toBeGreaterThan(10);
    expect(Array.isArray(resp.body.payload)).toBeTruthy();
    expect(resp.body.payload.length).toBeGreaterThan(0);
    expect(resp.body.payload[0]).toMatchObject({
      _id: /\d+/,
      givenName: /.+/,
      familyName: /.+/
    });
  });


  it('Should execute "update" endpoint', async () => {
    const d = new Date();
    const resp = await supertest(adapter.server)
        .patch('/Customers@1')
        .send({
          birthDate: d.toISOString(),
          fillerDate: d.toISOString(),
          active: 'f'
        });
    expect(resp.type).toStrictEqual('application/opra+json');
    expect(resp.body).toBeDefined();
    expect(resp.body.errors).not.toBeDefined();
    expect(resp.statusCode).toStrictEqual(200);
    expect(resp.body.context).toStrictEqual('/Customers');
    expect(resp.body.contextUrl).toMatch(/\/#\/root\/resources\/Customers$/);
    expect(resp.body.type).toStrictEqual('Customer');
    expect(resp.body.typeUrl).toMatch(/\/#\/types\/Customer$/);
    expect(resp.body.affected).toStrictEqual(1);
    expect(resp.body.payload).toMatchObject({
      _id: /\d+/,
      givenName: /.+/,
      familyName: /.+/,
      birthDate: /^\d{4}-\d{2}-\d{2}/,
      fillerDate: /^\d{4}-\d{2}-\d{2}/,
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
    expect(resp.statusCode).toStrictEqual(200);
    expect(resp.body.context).toStrictEqual('/Customers');
    expect(resp.body.contextUrl).toMatch(/\/#\/root\/resources\/Customers$/);
    expect(resp.body.affected).toBeGreaterThan(1);
  });

  it('Should execute "delete" endpoint', async () => {
    const resp = await supertest(adapter.server).delete('/Customers@10');
    expect(resp.type).toStrictEqual('application/opra+json');
    expect(resp.body).toBeDefined();
    expect(resp.body.errors).not.toBeDefined();
    expect(resp.statusCode).toStrictEqual(200);
    expect(resp.body.context).toStrictEqual('/Customers');
    expect(resp.body.contextUrl).toMatch(/\/#\/root\/resources\/Customers$/);
    expect(resp.body.affected).toStrictEqual(1);
  });

  it('Should execute "deleteMany" endpoint', async () => {
    const resp = await supertest(adapter.server).delete('/Customers');
    expect(resp.type).toStrictEqual('application/opra+json');
    expect(resp.body).toBeDefined();
    expect(resp.body.errors).not.toBeDefined();
    expect(resp.statusCode).toStrictEqual(200);
    expect(resp.body.context).toStrictEqual('/Customers');
    expect(resp.body.contextUrl).toMatch(/\/#\/root\/resources\/Customers$/);
    expect(resp.body.affected).toBeGreaterThan(1);
  });

});
