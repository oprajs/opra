import { OpraTestClient } from '@opra/testing';
import { createApp, TestApp } from '../_support/app/index.js';

describe('e2e: delete', function () {
  let app: TestApp;
  let client: OpraTestClient;

  beforeAll(async () => {
    app = await createApp();
    client = await OpraTestClient.create(app.server);
  });

  afterAll(async () => {
    await app?.db.close(0);
  })

  it('Should delete instance', async () => {
    let resp = await client.collection('Customers')
        .delete(101);
    resp.expect
        .toSuccess()
        .toReturnOperationResult()
        .toBeAffectedExact(1);
    resp = await client.collection('Customers')
        .get(101);
    resp.expect
        .toFail(404);
  })

});

