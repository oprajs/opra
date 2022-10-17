import { HttpHeaders } from '@opra/core';
import { opraTestClient, OpraTester } from '@opra/testing';
import { createApp, TestApp } from '../_support/app/index.js';

describe('e2e: search', function () {
  let app: TestApp;
  let client: OpraTester;

  beforeAll(async () => {
    app = await createApp();
    client = opraTestClient(app.server);
  });

  afterAll(async () => {
    await app?.db.close(0);
  })

  it('Should return list object', async () => {
    const resp = await client.entity('Customers')
        .search()
        .send();
    resp.expect
        .toSuccess()
        .toReturnArray()
        .toHaveMinItems(1);
  });

  it('Test "limit" option', async () => {
    const resp = await client.entity('Customers')
        .search()
        .limit(3)
        .send();
    resp.expect
        .toSuccess()
        .toReturnArray()
        .toHaveMaxItems(3);
  })

  it('Test "sort" option', async () => {
    const resp = await client.entity('Customers')
        .search()
        .sort('givenName')
        .send();
    resp.expect
        .toSuccess()
        .toReturnArray()
        .toBeSortedBy('givenName');
  })

  it('Test "skip" option', async () => {
    const resp = await client.entity('Customers')
        .search()
        .skip(10)
        .sort('id')
        .send();
    resp.expect
        .toSuccess()
        .toReturnArray();
    expect(resp.body[0].id).toBeGreaterThanOrEqual(10)
  })

  it('Test "pick" option', async () => {
    const resp = await client.entity('Customers')
        .search()
        .pick('givenName')
        .send();
    resp.expect
        .toSuccess()
        .toReturnArray()
        .toContainAllKeys(['givenName']);
  })

  it('Test "omit" option', async () => {
    const resp = await client.entity('Customers')
        .search()
        .omit('givenName')
        .send();
    resp.expect
        .toSuccess()
        .toReturnArray()
        .notToContainKeys(['givenName']);
  })

  it('Test "filter" option', async () => {
    const resp = await client.entity('Customers')
        .search()
        .filter('gender="M"')
        .send();
    resp.expect
        .toSuccess()
        .toReturnArray()
        .toHaveMinItems(1)
        .toBeFilteredBy('gender="M"');
  })

  it('Test "count" option', async () => {
    const resp = await client.entity('Customers')
        .search()
        .count()
        .send();
    resp.expect
        .toSuccess()
        .toReturnArray();
    expect(parseFloat(resp.get(HttpHeaders.X_Opra_Count))).toBeGreaterThanOrEqual(100);
  })

});

