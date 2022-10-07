import express from 'express';
import { OpraService } from '@opra/schema';
import { apiExpect, opraTest, OpraTester } from '@opra/testing';
import { OpraExpressAdapter } from '../../src/index.js';
import { createTestService } from '../_support/test-app/create-service.js';
import { customersData } from '../_support/test-app/data/customers.data.js';

describe('e2e: EntityResource:deleteMany', function () {

  let service: OpraService;
  let app;
  let api: OpraTester;

  beforeAll(async () => {
    service = await createTestService();
    app = express();
    await OpraExpressAdapter.init(app, service);
    api = opraTest(app);
  });

  it('Should delete many instances by filter', async () => {
    let resp = await api.entity('Customers')
        .deleteMany()
        .filter('id=100')
        .send();
    apiExpect(resp)
        .toSuccess()
        .toReturnObject(obj => {
          expect(obj.body.affected).toStrictEqual(1);
        })
    resp = await api.entity('Customers')
        .get(100).send();
    apiExpect(resp)
        .toFail(404);
  })

  it('Should delete all', async () => {
    let resp = await api.entity('Customers')
        .deleteMany()
        .send();
    apiExpect(resp)
        .toSuccess()
        .toReturnObject(obj => {
          expect(obj.body.affected).toStrictEqual(customersData.length - 1);
        })
    resp = await api.entity('Customers')
        .search()
        .count()
        .send();
    apiExpect(resp)
        .toSuccess()
        .toReturnList(list => {
          expect(list.body.count).toStrictEqual(0);
        })
  })

});
