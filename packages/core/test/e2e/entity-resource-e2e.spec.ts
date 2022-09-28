import express from 'express';
import { OpraService } from '@opra/schema';
import { apiExpect, opraTest, OpraTester } from '@opra/testing';
import { OpraExpressAdapter } from '../../src/index.js';
import { createTestService } from '../_support/test-app/create-service.js';

describe('Entity Resource e2e', function () {

  let service: OpraService;
  let app;
  let api: OpraTester;

  beforeAll(async () => {
    service = await createTestService();
    app = express();
    await OpraExpressAdapter.init(app, service);
    api = opraTest(app);
  });

  describe('"get" requests', function () {

    it('Should return object', async () => {
      const resp = await api.entity('Customers')
          .get('1').send();
      apiExpect(resp)
          .toSuccess()
          .toReturnObject(obj => {
            obj.toMatch({
              "id": 1
            })
          })
    })
  })

  describe('"search" search', function () {

    it('Should return list object', async () => {
      const resp = await api.entity('Customers')
          .search().send();
      apiExpect(resp)
          .toSuccess()
          .toReturnList(list => {
            list.toHaveMinItems(1);
          })
    })

    it('Should apply filter', async () => {
      const resp = await api.entity('Customers')
          .search()
          .filter('countryCode="US"')
          .send();
      apiExpect(resp)
          .toSuccess()
          .toReturnList(list => {
            list.toHaveMinItems(1);
            list.toBeFilteredBy('countryCode="US"');
          })
    })
  });


});
