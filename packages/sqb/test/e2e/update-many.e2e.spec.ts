import { faker } from '@faker-js/faker';
import { opraTestClient, OpraTester } from '@opra/testing';
import { createApp, TestApp } from '../_support/app/index.js';

describe('e2e: updateMany', function () {
  let app: TestApp;
  let client: OpraTester;

  beforeAll(async () => {
    app = await createApp();
    client = opraTestClient(app.server);
  });

  afterAll(async () => {
    await app?.db.close(0);
  })

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
        .toBeAffectedMin(1);

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

