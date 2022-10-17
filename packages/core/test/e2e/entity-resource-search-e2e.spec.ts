import express from 'express';
import { OpraApi } from '@opra/schema';
import { opraTestClient, OpraTester } from '@opra/testing';
import { HttpHeaders, OpraExpressAdapter } from '../../src/index.js';
import { createTestService } from '../_support/test-app/create-service.js';
import { customersData } from '../_support/test-app/data/customers.data.js';

describe('e2e: EntityResource:search', function () {

  let service: OpraApi;
  let app;
  let client: OpraTester;

  beforeAll(async () => {
    service = await createTestService();
    app = express();
    await OpraExpressAdapter.init(app, service);
    client = opraTestClient(app);
  });

  it('Should return list object', async () => {
    const resp = await client.entity('Customers')
        .search().send();
    resp.expect
        .toSuccess()
        .toReturnArray()
        .toHaveMinItems(1);
  })

  it('Should not send exclusive fields (unless not included for resolver)', async () => {
    const resp = await client.entity('Customers')
        .search()
        .send();
    resp.expect
        .toSuccess()
        .toReturnArray()
        .notToContainKeys(['address', 'notes']);
  })

  it('Should pick fields', async () => {
    const resp = await client.entity('Customers')
        .search()
        .pick('id', 'givenName')
        .send();
    resp.expect
        .toSuccess()
        .toReturnArray()
        .toContainAllKeys(['id', 'givenName']);
  })

  it('Should omit fields', async () => {
    const resp = await client.entity('Customers')
        .search()
        .omit('id', 'givenName')
        .send();
    resp.expect
        .toSuccess()
        .toReturnArray()
        .notToContainKeys(['id', 'givenName']);
  })

  it('Should include exclusive fields if requested (unless not excluded for resolver)', async () => {
    const resp = await client.entity('Customers')
        .search()
        .include('address')
        .send();
    resp.expect
        .toSuccess()
        .toReturnArray()
        .toContainKeys(['address']);
  })

  it('Should apply filter', async () => {
    const resp = await client.entity('Customers')
        .search()
        .filter('countryCode="' + customersData[0].countryCode + '"')
        .send();
    resp.expect
        .toSuccess()
        .toReturnArray()
        .toHaveMinItems(1)
        .toBeFilteredBy('countryCode="' + customersData[0].countryCode + '"');
  })

  it('Should set item limit to be returned', async () => {
    const resp = await client.entity('Customers')
        .search()
        .limit(3)
        .send();
    resp.expect
        .toSuccess()
        .toReturnArray()
        .toHaveMaxItems(3);
  })

  it('Should set offset of the list to be returned', async () => {
    const resp = await client.entity('Customers')
        .search()
        .skip(10)
        .send();
    resp.expect
        .toSuccess()
        .toReturnArray();
    resp.body.forEach(x =>
        expect(x.id).toBeGreaterThan(10));
  })

  it('Should count matching records', async () => {
    const resp = await client.entity('Customers')
        .search()
        .count()
        .send();
    resp.expect
        .toSuccess()
        .toReturnArray();
    expect(resp.get(HttpHeaders.X_Opra_Count)).toStrictEqual('' + customersData.length);
  })

});
