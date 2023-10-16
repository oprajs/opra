/* eslint-disable @typescript-eslint/no-non-null-assertion */
import supertest from 'supertest';
import { ApiDocument } from '@opra/common';
import { NodeHttpAdapter } from '@opra/core';
import { NodeHttpAdapterHost } from '@opra/core/http/adapters/node-http-adapter.host';
import { createTestApi } from '../_support/test-app/index.js';

describe('e2e:Singleton', function () {

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
        .post('/auth/MyProfile')
        .send({
          givenName: 'abcd',
          familyName: 'efgh',
        });
    expect(resp.type).toStrictEqual('application/opra+json');
    expect(resp.body).toBeDefined();
    expect(resp.body.errors).not.toBeDefined();
    expect(resp.statusCode).toStrictEqual(201);
    expect(resp.body.context).toStrictEqual('/auth/MyProfile');
    expect(resp.body.contextUrl).toMatch(/\/#\/root\/resources\/auth\/resources\/MyProfile$/);
    expect(resp.body.type).toStrictEqual('Profile');
    expect(resp.body.typeUrl).toMatch(/\/#\/types\/Profile$/);
    expect(resp.body.affected).toStrictEqual(1);
    expect(resp.body.payload).toMatchObject({
      _id: /\d+/,
      givenName: /.+/,
      familyName: /.+/
    });

  });

  it('Should execute "get" endpoint', async () => {
    const resp = await supertest(adapter.server)
        .get('/auth/MyProfile');
    expect(resp.type).toStrictEqual('application/opra+json');
    expect(resp.body).toBeDefined();
    expect(resp.body.errors).not.toBeDefined();
    expect(resp.statusCode).toStrictEqual(200);
    expect(resp.body.context).toStrictEqual('/auth/MyProfile');
    expect(resp.body.contextUrl).toMatch(/\/#\/root\/resources\/auth\/resources\/MyProfile$/);
    expect(resp.body.type).toStrictEqual('Profile');
    expect(resp.body.typeUrl).toMatch(/\/#\/types\/Profile$/);
    expect(resp.body.payload).toMatchObject({
      _id: /\d+/,
      givenName: /.+/,
      familyName: /.+/
    });
  });

  it('Should execute "update" endpoint', async () => {
    const resp = await supertest(adapter.server)
        .patch('/auth/MyProfile')
        .send({
          birthDate: new Date().toISOString()
        });
    expect(resp.type).toStrictEqual('application/opra+json');
    expect(resp.body).toBeDefined();
    expect(resp.body.errors).not.toBeDefined();
    expect(resp.statusCode).toStrictEqual(200);
    expect(resp.body.context).toStrictEqual('/auth/MyProfile');
    expect(resp.body.contextUrl).toMatch(/\/#\/root\/resources\/auth\/resources\/MyProfile$/);
    expect(resp.body.type).toStrictEqual('Profile');
    expect(resp.body.typeUrl).toMatch(/\/#\/types\/Profile$/);
    expect(resp.body.affected).toStrictEqual(1);
    expect(resp.body.payload).toMatchObject({
      _id: /\d+/,
      givenName: /.+/,
      familyName: /.+/,
      birthDate: /^\d{4}-\d{2}-\d{2}/
    });
  });

  it('Should execute "delete" endpoint', async () => {
    const resp = await supertest(adapter.server)
        .delete('/auth/MyProfile');
    expect(resp.type).toStrictEqual('application/opra+json');
    expect(resp.body).toBeDefined();
    expect(resp.body.errors).not.toBeDefined();
    expect(resp.statusCode).toStrictEqual(200);
    expect(resp.body.context).toStrictEqual('/auth/MyProfile');
    expect(resp.body.contextUrl).toMatch(/\/#\/root\/resources\/auth\/resources\/MyProfile$/);
    expect(resp.body.affected).toStrictEqual(1);
  });

});
