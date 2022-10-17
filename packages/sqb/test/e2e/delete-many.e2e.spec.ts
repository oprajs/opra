import { opraTestClient, OpraTester } from '@opra/testing';
import { createApp, TestApp } from '../_support/app/index.js';

describe('e2e: deleteMany', function () {
  let app: TestApp;
  let client: OpraTester;

  beforeAll(async () => {
    app = await createApp();
    client = opraTestClient(app.server);
  });

  afterAll(async () => {
    await app?.db.close(0);
  })

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
});

