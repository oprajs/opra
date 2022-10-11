import express from 'express';
import { faker } from '@faker-js/faker';
import { OpraService } from '@opra/schema';
import { opraTest, OpraTester } from '@opra/testing';
import { OpraExpressAdapter } from '../../src/index.js';
import { createTestService } from '../_support/test-app/create-service.js';
import { customersData } from '../_support/test-app/data/customers.data.js';

describe('e2e: EntityResource:updateMany', function () {

  let service: OpraService;
  let app;
  let api: OpraTester;

  beforeAll(async () => {
    service = await createTestService();
    app = express();
    await OpraExpressAdapter.init(app, service);
    api = opraTest(app);
  });

  it('Should update many instances', async () => {
    const data = {
      city: faker.address.city()
    }
    let resp = await api.entity('Customers')
        .updateMany(data)
        .send();
    resp.expect
        .toSuccess()
        .toReturnOperationResult()
        .toBeAffectedExact(customersData.length);

    resp = await api.entity('Customers')
        .search()
        .limit(1000000)
        .send();
    resp.expect
        .toSuccess()
        .toReturnArray()
        .toMatch(data);
  })

  it('Should update many instances by filter', async () => {
    const data = {
      city: 'x-' + faker.address.city()
    }
    let resp = await api.entity('Customers')
        .updateMany(data)
        .filter('id<=10')
        .send();
    resp.expect
        .toSuccess()
        .toReturnOperationResult()
        .toBeAffectedMin(10)
    resp = await api.entity('Customers')
        .search()
        .filter('city="' + data.city + '"')
        .send();
    resp.expect
        .toSuccess()
        .toReturnArray()
        .toHaveExactItems(10)
        .toMatch(data);
  })

});
