import express from 'express';
import { OpraDocument } from '@opra/schema';
import { OpraTestClient } from '@opra/testing';
import { OpraExpressAdapter } from '../../src/index.js';
import { createTestDocument } from '../_support/test-app/create-service.js';
import { customersData } from '../_support/test-app/data/customers.data.js';

describe('e2e: CollectionResource:deleteMany', function () {

  let service: OpraDocument;
  let app;
  let client: OpraTestClient;

  beforeAll(async () => {
    service = await createTestDocument();
    app = express();
    await OpraExpressAdapter.init(app, service);
    client = await OpraTestClient.create(app);
  });

  it('Should delete many instances by filter', async () => {
    let resp = await client.collection('Customers')
        .deleteMany()
        .filter('id=102');
    resp.expect
        .toSuccess()
        .toReturnOperationResult()
        .toBeAffectedExact(1);
    resp = await client.collection('Customers')
        .get(102);
    resp.expect
        .toFail(404);
  })

  it('Should delete all', async () => {
    let resp = await client.collection('Customers')
        .deleteMany();
    resp.expect
        .toSuccess()
        .toReturnOperationResult()
        .toBeAffectedExact(customersData.length - 1);
    resp = await client.collection('Customers')
        .search()
        .count();
    resp.expect
        .toSuccess()
        .toReturnCollection()
        .toHaveExactItems(0);
  })

});
