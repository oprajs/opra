import express from 'express';
import { OpraDocument } from '@opra/common';
import { OpraTestClient } from '@opra/testing';
import { OpraExpressAdapter } from '../../src/index.js';
import { createTestDocument } from '../_support/test-app/create-document.js';

describe('e2e: SingletonResource:get', function () {

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
    const resp = await client.singleton('BestCustomer')
        .get()
        .fetch();
    resp.expect
        .toSuccess()
        .toReturnObject()
        .toMatch({id: 10})
  });

});
