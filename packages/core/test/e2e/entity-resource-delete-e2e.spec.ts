import express from 'express';
import { OpraService } from '@opra/schema';
import { opraTest, OpraTester } from '@opra/testing';
import { OpraExpressAdapter } from '../../src/index.js';
import { createTestService } from '../_support/test-app/create-service.js';

describe('e2e: EntityResource:delete', function () {

  let service: OpraService;
  let app;
  let api: OpraTester;

  beforeAll(async () => {
    service = await createTestService();
    app = express();
    await OpraExpressAdapter.init(app, service);
    api = opraTest(app);
  });

  it('Should delete instance', async () => {
    let resp = await api.entity('Customers')
        .delete(100).send();
    resp.expect
        .toSuccess()
        .toReturnOperationResult()
        .toBeAffectedExact(1);
    resp = await api.entity('Customers')
        .get(100).send();
    resp.expect
        .toFail(404);
  })

});
