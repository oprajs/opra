/* eslint-disable @typescript-eslint/no-non-null-assertion */
import supertest from 'supertest';
import { ApiDocument } from '@opra/common';
import { HttpAdapter } from '@opra/core';
import { HttpAdapterHost } from '@opra/core/adapter/http/http-adapter.host.js';
import { createTestApi } from '../_support/test-app/index.js';

describe('e2e:Singleton', function () {

  let api: ApiDocument;
  let adapter: HttpAdapterHost;

  beforeAll(async () => {
    api = await createTestApi();
    adapter = await HttpAdapter.create(api) as HttpAdapterHost;
  });

  afterAll(async () => {
    await adapter.close();
  })

  it('Should execute "create" endpoint', async () => {
    const resp = await supertest(adapter.server).post('/MyProfile')
        .send({
          givenName: 'abcd',
          familyName: 'efgh',
        });
    expect(resp.type).toStrictEqual('application/opra+json');
    expect(resp.body).toBeDefined();
    expect(resp.body.errors).not.toBeDefined();
    expect(resp.body).toMatchObject({
      source: 'MyProfile',
      endpoint: 'create',
      affected: 1
    });
    expect(resp.body.data).toMatchObject({
      _id: /\d+/,
      givenName: /.+/,
      familyName: /.+/
    });
  });

  it('Should execute "get" endpoint', async () => {
    const resp = await supertest(adapter.server).get('/MyProfile');
    expect(resp.type).toStrictEqual('application/opra+json');
    expect(resp.body).toBeDefined();
    expect(resp.body.errors).not.toBeDefined();
    expect(resp.body).toMatchObject({
      source: 'MyProfile',
      endpoint: 'get'
    });
    expect(resp.body.data).toMatchObject({
      _id: /\d+/,
      givenName: /.+/,
      familyName: /.+/
    });
  });

  it('Should execute "update" endpoint', async () => {
    const resp = await supertest(adapter.server)
        .patch('/MyProfile')
        .send({
          birthDate: new Date().toISOString()
        });
    expect(resp.type).toStrictEqual('application/opra+json');
    expect(resp.body).toBeDefined();
    expect(resp.body.errors).not.toBeDefined();
    expect(resp.body).toMatchObject({
      source: 'MyProfile',
      endpoint: 'update',
      affected: 1
    });
    expect(resp.body.data).toMatchObject({
      _id: /\d+/,
      givenName: /.+/,
      familyName: /.+/,
      birthDate: /^\d{4}-\d{2}-\d{2}/
    });
  });

  it('Should execute "delete" endpoint', async () => {
    const resp = await supertest(adapter.server).delete('/MyProfile');
    expect(resp.type).toStrictEqual('application/opra+json');
    expect(resp.body).toBeDefined();
    expect(resp.body.errors).not.toBeDefined();
    expect(resp.body).toMatchObject({
      source: 'MyProfile',
      operation: 'delete',
      affected: 1
    });
  });

});
