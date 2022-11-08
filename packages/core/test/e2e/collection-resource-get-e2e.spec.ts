import express from 'express';
import { OpraDocument } from '@opra/schema';
import { OpraTestClient } from '@opra/testing';
import { OpraExpressAdapter } from '../../src/index.js';
import { createTestDocument } from '../_support/test-app/create-service.js';

describe('e2e: CollectionResource:get', function () {

  let service: OpraDocument;
  let app;
  let client: OpraTestClient;

  beforeAll(async () => {
    service = await createTestDocument();
    app = express();
    await OpraExpressAdapter.init(app, service);
    client = await OpraTestClient.create(app);
  });

  it('Should return object', async () => {
    const resp = await client.collection('Customers').get(1);
    resp.expect
        .toSuccess()
        .toReturnObject()
        .toMatch({id: 1})
  })

  it('Should not send exclusive fields by default', async () => {
    const resp = await client.collection('Customers')
        .get(1);
    resp.expect
        .toSuccess()
        .toReturnObject()
        .not.toHaveFields(['address', 'notes']);
  })

  it('Should include exclusive fields if requested', async () => {
    const resp = await client.collection('Customers')
        .get('1')
        .include('address');
    resp.expect
        .toSuccess()
        .toReturnObject()
        .toHaveFields(['address']);
  })

  it('Should pick fields to be returned', async () => {
    const resp = await client.collection('Customers')
        .get(1)
        .pick('id', 'givenName');
    resp.expect
        .toSuccess()
        .toReturnObject()
        .toHaveFieldsOnly(['id', 'givenName']);
  })

  it('Should omit fields to be returned', async () => {
    const resp = await client.collection('Customers')
        .get(1)
        .omit('id', 'givenName');
    resp.expect
        .toSuccess()
        .toReturnObject()
        .not.toHaveFields(['id', 'givenName']);
  })

});
