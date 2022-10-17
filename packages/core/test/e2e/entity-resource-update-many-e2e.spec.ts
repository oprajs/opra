import express from 'express';
import { faker } from '@faker-js/faker';
import { OpraApi } from '@opra/schema';
import { opraTestClient, OpraTester } from '@opra/testing';
import { OpraExpressAdapter } from '../../src/index.js';
import { createTestService } from '../_support/test-app/create-service.js';
import { customersData } from '../_support/test-app/data/customers.data.js';

describe('e2e: CollectionResource:updateMany', function () {

  let service: OpraApi;
  let app;
  let client: OpraTester;

  beforeAll(async () => {
    service = await createTestService();
    app = express();
    await OpraExpressAdapter.init(app, service);
    client = opraTestClient(app);
  });

  it('Should update many instances', async () => {
    const data = {
      identity: '' + faker.datatype.number()
    }
    let resp = await client.entity('Customers')
        .updateMany(data)
        .send();
    resp.expect
        .toSuccess()
        .toReturnOperationResult()
        .toBeAffectedExact(customersData.length);

    resp = await client.entity('Customers')
        .search()
        .filter('identity="' + data.identity + '"')
        .limit(1000000)
        .send();
    resp.expect
        .toSuccess()
        .toReturnArray()
        .toMatch(data);
  })

  it('Should update many instances by filter', async () => {
    const data = {
      identity: '' + faker.datatype.number()
    }
    let resp = await client.entity('Customers')
        .updateMany(data)
        .filter('id<=10')
        .send();
    resp.expect
        .toSuccess()
        .toReturnOperationResult()
        .toBeAffectedMin(10)
    resp = await client.entity('Customers')
        .search()
        .filter('identity="' + data.identity + '"')
        .send();
    resp.expect
        .toSuccess()
        .toReturnArray()
        .toHaveExactItems(10)
        .toMatch(data);
  })

});
