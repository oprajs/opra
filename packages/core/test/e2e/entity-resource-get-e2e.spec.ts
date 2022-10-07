import express from 'express';
import { OpraService } from '@opra/schema';
import { apiExpect, opraTest, OpraTester } from '@opra/testing';
import { OpraExpressAdapter } from '../../src/index.js';
import { createTestService } from '../_support/test-app/create-service.js';

describe('e2e: EntityResource:get', function () {

  let service: OpraService;
  let app;
  let api: OpraTester;

  beforeAll(async () => {
    service = await createTestService();
    app = express();
    await OpraExpressAdapter.init(app, service);
    api = opraTest(app);
  });

  it('Should return object', async () => {
    const resp = await api.entity('Customers')
        .get('1').send();
    apiExpect(resp)
        .toSuccess()
        .toReturnObject(obj => {
          obj.toMatch({
            "id": 1
          });
        })
  })

  it('Should not send exclusive fields (unless not included for resolver)', async () => {
    const resp = await api.entity('Customers')
        .get('1')
        .send();
    apiExpect(resp)
        .toSuccess()
        .toReturnObject(obj => {
          obj.notToContainKeys(['address', 'notes']);
        })
  })

  it('Should pick fields to be returned', async () => {
    const resp = await api.entity('Customers')
        .get('1')
        .pick('id', 'givenName')
        .send();
    apiExpect(resp)
        .toSuccess()
        .toReturnObject(obj => {
          obj.toContainKeys(['id', 'givenName']);
        })
  })

  it('Should omit fields to be returned', async () => {
    const resp = await api.entity('Customers')
        .get('1')
        .omit('id', 'givenName')
        .send();
    apiExpect(resp)
        .toSuccess()
        .toReturnObject(obj => {
          obj.notToContainKeys(['id', 'givenName']);
        })
  })

  it('Should include exclusive fields if requested', async () => {
    const resp = await api.entity('Customers')
        .get('1')
        .include('address')
        .send();
    apiExpect(resp)
        .toSuccess()
        .toReturnObject(obj => {
          obj.toContainKeys(['address']);
        })
  })

});
