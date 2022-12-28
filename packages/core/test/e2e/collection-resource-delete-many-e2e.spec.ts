import express from 'express';
import { OpraDocument } from '@opra/common';
import { OpraTestClient } from '@opra/testing';
import { OpraExpressAdapter } from '../../src/index.js';
import { createTestDocument } from '../_support/test-app/create-document.js';
import { customersData } from '../_support/test-app/data/customers.data.js';

describe('e2e: CollectionResource:deleteMany', function () {

  let document: OpraDocument;
  let app;
  let client: OpraTestClient;

  beforeAll(async () => {
    document = await createTestDocument();
    app = express();
    await OpraExpressAdapter.init(app, document);
    client = new OpraTestClient(app, {document});
  });

  it('Should delete many instances by filter', async () => {
    const resp = await client.collection('Customers')
        .deleteMany({filter: 'id=102'})
        .fetch();
    resp.expect
        .toSuccess()
        .toReturnOperationResult()
        .toBeAffectedExact(1);
    await expect(() =>
        client.collection('Customers').get(102).fetch()
    ).rejects.toThrow('404');
  })

  it('Should delete all', async () => {
    let resp = await client.collection('Customers')
        .deleteMany()
        .fetch();
    resp.expect
        .toSuccess()
        .toReturnOperationResult()
        .toBeAffectedExact(customersData.length - 1);
    resp = await client.collection('Customers')
        .search({count: true})
        .fetch();
    resp.expect
        .toSuccess()
        .toReturnCollection()
        .toHaveExactItems(0);
  })

});
