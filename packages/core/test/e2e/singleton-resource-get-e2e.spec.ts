import express from 'express';
import { OpraDocument } from '@opra/schema';
import { OpraTestClient } from '@opra/testing';
import { OpraExpressAdapter } from '../../src/index.js';
import { createTestDocument } from '../_support/test-app/create-document.js';

describe('e2e: SingletonResource:get', function () {

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
    const resp = await client.singleton('BestCustomer')
        .get()
        .execute();
    resp.expect
        .toSuccess()
        .toReturnObject()
        .toMatch({id: 10})
  });

});
