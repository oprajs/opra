import express from 'express';
import { OpraDocument } from '@opra/common';
import { OpraTestClient } from '@opra/testing';
import { OpraExpressAdapter } from '../../src/index.js';
import { createTestDocument } from '../_support/test-app/create-document.js';

describe('e2e: CollectionResource:delete', function () {

  let document: OpraDocument;
  let app;
  let client: OpraTestClient;

  beforeAll(async () => {
    document = await createTestDocument();
    app = express();
    await OpraExpressAdapter.init(app, document);
    client = new OpraTestClient(app, {document});
  });

  it('Should delete instance', async () => {
    const resp = await client.collection('Customers')
        .delete(101)
        .fetch();
    resp.expect
        .toSuccess()
        .toReturnOperationResult()
        .toBeAffectedExact(1);
    await expect(() =>
        client.collection('Customers').get(101).fetch()
    ).rejects.toThrow('404')
  })

});
