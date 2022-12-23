import express from 'express';
import { OpraDocument } from '@opra/common';
import { OpraTestClient } from '@opra/testing';
import { OpraExpressAdapter } from '../../src/index.js';
import { createTestDocument } from '../_support/test-app/create-document.js';

describe('e2e: CollectionResource:get', function () {

  let document: OpraDocument;
  let app;
  let client: OpraTestClient;

  beforeAll(async () => {
    document = await createTestDocument();
    app = express();
    await OpraExpressAdapter.init(app, document);
    client = new OpraTestClient(app, {document});
  });

  it('Should return object', async () => {
    const resp = await client.collection('Customers')
        .get(1)
        .fetch();
    resp.expect
        .toSuccess()
        .toReturnObject()
        .toMatch({id: 1})
  })

  it('Should not send exclusive fields by default', async () => {
    const resp = await client.collection('Customers')
        .get(1)
        .fetch();
    resp.expect
        .toSuccess()
        .toReturnObject()
        .not.toHaveFields(['address', 'notes']);
  })

  it('Should include exclusive fields if requested', async () => {
    const resp = await client.collection('Customers')
        .get('1', {include: ['address']})
        .fetch();
    resp.expect
        .toSuccess()
        .toReturnObject()
        .toHaveFields(['address']);
  })

  it('Should pick fields to be returned', async () => {
    const resp = await client.collection('Customers')
        .get(1, {pick: ['id', 'givenName']})
        .fetch();
    resp.expect
        .toSuccess()
        .toReturnObject()
        .toHaveFieldsOnly(['id', 'givenName']);
  })

  it('Should omit fields to be returned', async () => {
    const resp = await client.collection('Customers')
        .get(1, {omit: ['id', 'givenName']})
        .fetch();
    resp.expect
        .toSuccess()
        .toReturnObject()
        .not.toHaveFields(['id', 'givenName']);
  })

});
