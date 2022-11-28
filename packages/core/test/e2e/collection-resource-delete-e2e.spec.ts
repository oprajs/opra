import express from 'express';
import { OpraDocument } from '@opra/schema';
import { OpraTestClient } from '@opra/testing';
import { OpraExpressAdapter } from '../../src/index.js';
import { createTestDocument } from '../_support/test-app/create-document.js';

describe('e2e: CollectionResource:delete', function () {

  let service: OpraDocument;
  let app;
  let client: OpraTestClient;

  beforeAll(async () => {
    service = await createTestDocument();
    app = express();
    await OpraExpressAdapter.init(app, service);
    client = await OpraTestClient.create(app);
  });

  it('Should delete instance', async () => {
    let resp = await client.collection('Customers')
        .delete(101)
        .toPromise();
    resp.expect
        .toSuccess()
        .toReturnOperationResult()
        .toBeAffectedExact(1);
    resp = await client.collection('Customers')
        .get(101)
        .toPromise();
    resp.expect
        .toFail(404);
  })

});
