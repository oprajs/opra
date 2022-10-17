import express from 'express';
import { OpraApi } from '@opra/schema';
import { opraTestClient, OpraTester } from '@opra/testing';
import { OpraExpressAdapter } from '../../src/index.js';
import { createTestService } from '../_support/test-app/create-service.js';

describe('e2e: CollectionResource:get', function () {

  let service: OpraApi;
  let app;
  let client: OpraTester;

  beforeAll(async () => {
    service = await createTestService();
    app = express();
    await OpraExpressAdapter.init(app, service);
    client = opraTestClient(app);
  });

  it('Should return object', async () => {
    const resp = await client.entity('Customers')
        .get(1).send();
    resp.expect
        .toSuccess()
        .toReturnObject()
        .toMatch({id: 1})
  })

  it('Should not send exclusive fields (unless not included for resolver)', async () => {
    const resp = await client.entity('Customers')
        .get(1)
        .send();
    resp.expect
        .toSuccess()
        .toReturnObject()
        .notToContainKeys(['address', 'notes']);
  })

  it('Should pick fields to be returned', async () => {
    const resp = await client.entity('Customers')
        .get(1)
        .pick('id', 'givenName')
        .send();
    resp.expect
        .toSuccess()
        .toReturnObject()
        .toContainKeys(['id', 'givenName']);
  })

  it('Should omit fields to be returned', async () => {
    const resp = await client.entity('Customers')
        .get(1)
        .omit('id', 'givenName')
        .send();
    resp.expect
        .toSuccess()
        .toReturnObject()
        .notToContainKeys(['id', 'givenName']);
  })

  it('Should include exclusive fields if requested', async () => {
    const resp = await client.entity('Customers')
        .get('1')
        .include('address')
        .send();
    resp.expect
        .toSuccess()
        .toReturnObject()
        .toContainKeys(['address']);
  })

});
