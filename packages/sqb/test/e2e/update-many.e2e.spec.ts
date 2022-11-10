import { faker } from '@faker-js/faker';
import { OpraTestClient } from '@opra/testing';
import { createApp, TestApp } from '../_support/app/index.js';

describe('e2e: updateMany', function () {
  let app: TestApp;
  let client: OpraTestClient;

  beforeAll(async () => {
    app = await createApp();
    client = await OpraTestClient.create(app.server);
  });

  afterAll(async () => {
    await app?.db.close(0);
  })

  it('Should update many instances', async () => {
    const data = {
      identity: '' + faker.datatype.number()
    }
    let resp = await client.collection('Customers')
        .updateMany(data);
    resp.expect
        .toSuccess()
        .toReturnOperationResult()
        .toBeAffectedMin(1);

    resp = await client.collection('Customers')
        .search({
          filter: 'identity="' + data.identity + '"',
          limit: 1000000
        });
    resp.expect
        .toSuccess()
        .toReturnCollection()
        .toMatch(data);
  })

  it('Should update many instances by filter', async () => {
    const data = {
      identity: '' + faker.datatype.number()
    }
    let resp = await client.collection('Customers')
        .updateMany(data, {filter: 'id<=10'});
    resp.expect
        .toSuccess()
        .toReturnOperationResult()
        .toBeAffectedMin(10)
    resp = await client.collection('Customers')
        .search({filter: 'identity="' + data.identity + '"'});
    resp.expect
        .toSuccess()
        .toReturnCollection()
        .toHaveExactItems(10)
        .toMatch(data);
  })
});

