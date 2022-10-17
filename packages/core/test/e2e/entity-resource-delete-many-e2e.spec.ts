import express from 'express';
import { OpraApi } from '@opra/schema';
import { opraTestClient, OpraTester } from '@opra/testing';
import { OpraExpressAdapter } from '../../src/index.js';
import { createTestService } from '../_support/test-app/create-service.js';
import { customersData } from '../_support/test-app/data/customers.data.js';

describe('e2e: EntityResource:deleteMany', function () {

  let service: OpraApi;
  let app;
  let client: OpraTester;

  beforeAll(async () => {
    service = await createTestService();
    app = express();
    await OpraExpressAdapter.init(app, service);
    client = opraTestClient(app);
  });

  it('Should delete many instances by filter', async () => {
    let resp = await client.entity('Customers')
        .deleteMany()
        .filter('id=102')
        .send();
    resp.expect
        .toSuccess()
        .toReturnOperationResult()
        .toBeAffectedExact(1);
    resp = await client.entity('Customers')
        .get(102).send();
    resp.expect
        .toFail(404);
  })

  it('Should delete all', async () => {
    let resp = await client.entity('Customers')
        .deleteMany()
        .send();
    resp.expect
        .toSuccess()
        .toReturnOperationResult()
        .toBeAffectedExact(customersData.length - 1);
    resp = await client.entity('Customers')
        .search()
        .count()
        .send();
    resp.expect
        .toSuccess()
        .toReturnArray();
    expect(resp.body.length).toStrictEqual(0);
  })

});
