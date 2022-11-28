import express from 'express';
import { faker } from '@faker-js/faker';
import { OpraDocument } from '@opra/schema';
import { OpraTestClient } from '@opra/testing';
import { OpraExpressAdapter } from '../../src/index.js';
import { createTestDocument } from '../_support/test-app/create-document.js';
import { customersData } from '../_support/test-app/data/customers.data.js';

describe('e2e: CollectionResource:updateMany', function () {

  let service: OpraDocument;
  let app;
  let client: OpraTestClient;

  beforeAll(async () => {
    service = await createTestDocument();
    app = express();
    await OpraExpressAdapter.init(app, service);
    client = await OpraTestClient.create(app);
  });

  it('Should update many instances', async () => {
    const data = {
      identity: '' + faker.datatype.number()
    }
    let resp = await client.collection('Customers')
        .updateMany(data)
        .execute();
    resp.expect
        .toSuccess()
        .toReturnOperationResult()
        .toBeAffectedExact(customersData.length);

    resp = await client.collection('Customers')
        .search({
          filter: 'identity="' + data.identity + '"',
          limit: 1000000
        })
        .execute();
    resp.expect
        .toSuccess()
        .toReturnCollection()
        .toMatch(data);
  })

  it('Should update many instances by filter', async () => {
    const data = {
      identity: '' + faker.datatype.number()
    }
    let resp = await client.collection('Customers')
        .updateMany(data, {filter: 'id<=10'})
        .execute();
    resp.expect
        .toSuccess()
        .toReturnOperationResult()
        .toBeAffectedMin(10)
    resp = await client.collection('Customers')
        .search({filter: 'identity="' + data.identity + '"'})
        .execute();

    resp.expect
        .toSuccess()
        .toReturnCollection()
        .toHaveExactItems(10)
        .toMatch(data);
  })

});
