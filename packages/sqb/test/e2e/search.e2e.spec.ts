import { HttpHeaders } from '@opra/common';
import { OpraTestClient } from '@opra/testing';
import { createApp, TestApp } from '../_support/app/index.js';

describe('e2e: search', function () {
  let app: TestApp;
  let client: OpraTestClient;

  beforeAll(async () => {
    app = await createApp();
    client = await OpraTestClient.create(app.server);
  });

  afterAll(async () => {
    await app?.db.close(0);
  })

  it('Should return list object', async () => {
    const resp = await client.collection('Customers')
        .search()
        .execute();
    resp.expect
        .toSuccess()
        .toReturnCollection()
        .toHaveMinItems(1);
  });

  it('Test "limit" option', async () => {
    const resp = await client.collection('Customers')
        .search({limit: 3})
        .execute();
    resp.expect
        .toSuccess()
        .toReturnCollection()
        .toHaveMaxItems(3);
  })

  it('Test "sort" option', async () => {
    const resp = await client.collection('Customers')
        .search({sort: ['givenName']})
        .execute();
    resp.expect
        .toSuccess()
        .toReturnCollection()
        .toBeSortedBy('givenName');
  })

  it('Test "skip" option', async () => {
    const resp = await client.collection('Customers')
        .search({skip: 10, sort: ['id']})
        .execute();
    resp.expect
        .toSuccess()
        .toReturnCollection()
        .toHaveMinItems(1);
    expect(resp.data[0].id).toBeGreaterThanOrEqual(10);
  })

  it('Test "pick" option', async () => {
    const resp = await client.collection('Customers')
        .search({pick: ['givenName']})
        .execute();
    resp.expect
        .toSuccess()
        .toReturnCollection()
        .toHaveFieldsOnly(['givenName']);
  })

  it('Test "omit" option', async () => {
    const resp = await client.collection('Customers')
        .search({omit: ['givenName']})
        .execute();
    resp.expect
        .toSuccess()
        .toReturnCollection()
        .not.toHaveFields(['givenName']);
  })

  it('Test "filter" option', async () => {
    const resp = await client.collection('Customers')
        .search({filter: 'gender="M"'})
        .execute();
    resp.expect
        .toSuccess()
        .toReturnCollection()
        .toHaveMinItems(1)
        .toBeFilteredBy('gender="M"');
  })

  it('Test "count" option', async () => {
    const resp = await client.collection('Customers')
        .search({count: true})
        .execute();
    resp.expect
        .toSuccess()
        .toReturnCollection();
    expect(parseFloat('' + resp.headers.get(HttpHeaders.X_Opra_Count))).toBeGreaterThanOrEqual(100);
  })

});

