import express from 'express';
import { OpraDocument } from '@opra/schema';
import { OpraTestClient } from '@opra/testing';
import { HttpHeaders, OpraExpressAdapter } from '../../src/index.js';
import { createTestDocument } from '../_support/test-app/create-service.js';
import { customersData } from '../_support/test-app/data/customers.data.js';

describe('e2e: CollectionResource:search', function () {

  let service: OpraDocument;
  let app;
  let client: OpraTestClient;

  beforeAll(async () => {
    service = await createTestDocument();
    app = express();
    await OpraExpressAdapter.init(app, service);
    client = await OpraTestClient.create(app);
  });

  it('Should return list object', async () => {
    const resp = await client.collection('Customers')
        .search();
    resp.expect
        .toSuccess()
        .toReturnCollection()
        .toHaveMinItems(1);
  })

  it('Should not send exclusive fields by default', async () => {
    const resp = await client.collection('Customers')
        .search();
    resp.expect
        .toSuccess()
        .toReturnCollection()
        .not.toHaveFields(['address', 'notes']);
  })

  it('Should include exclusive fields if requested (unless not excluded for resolver)', async () => {
    const resp = await client.collection('Customers')
        .search()
        .include('address');
    resp.expect
        .toSuccess()
        .toReturnCollection()
        .toHaveFields(['address']);
  })

  it('Should pick fields', async () => {
    const resp = await client.collection('Customers')
        .search()
        .pick('id', 'givenName');
    resp.expect
        .toSuccess()
        .toReturnCollection()
        .toHaveFieldsOnly(['id', 'givenName']);
  })

  it('Should omit fields', async () => {
    const resp = await client.collection('Customers')
        .search()
        .omit('id', 'givenName');
    resp.expect
        .toSuccess()
        .toReturnCollection()
        .not.toHaveFields(['id', 'givenName']);
  })

  it('Should apply filter', async () => {
    const resp = await client.collection('Customers')
        .search()
        .filter('countryCode="' + customersData[0].countryCode + '"');
    resp.expect
        .toSuccess()
        .toReturnCollection()
        .toHaveMinItems(1)
        .toBeFilteredBy('countryCode="' + customersData[0].countryCode + '"');
  })

  it('Should set item limit to be returned', async () => {
    const resp = await client.collection('Customers')
        .search()
        .limit(3);
    resp.expect
        .toSuccess()
        .toReturnCollection()
        .toHaveMaxItems(3);
  })

  it('Should set offset of the list to be returned', async () => {
    const resp = await client.collection('Customers')
        .search()
        .skip(10);
    resp.expect
        .toSuccess()
        .toReturnCollection()
        .forEach(x => expect(x.id).toBeGreaterThan(10));
  })

  it('Should count matching records', async () => {
    const resp = await client.collection('Customers')
        .search()
        .count();
    resp.expect
        .toSuccess()
        .toReturnCollection();
    expect(resp.headers.has(HttpHeaders.X_Opra_Count)).toBeTruthy();
    expect(resp.headers.get(HttpHeaders.X_Opra_Count)).toStrictEqual('' + customersData.length);
  })

});
