import express from 'express';
import { HttpHeaders } from '@opra/common';
import { OpraDocument } from '@opra/schema';
import { OpraTestClient } from '@opra/testing';
import { OpraExpressAdapter } from '../../src/index.js';
import { createTestDocument } from '../_support/test-app/create-document.js';
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
        .search()
        .execute();
    resp.expect
        .toSuccess()
        .toReturnCollection()
        .toHaveMinItems(1);
  })

  it('Should not send exclusive fields by default', async () => {
    const resp = await client.collection('Customers')
        .search()
        .execute();
    resp.expect
        .toSuccess()
        .toReturnCollection()
        .not.toHaveFields(['address', 'notes']);
  })

  it('Should include exclusive fields if requested (unless not excluded for resolver)', async () => {
    const resp = await client.collection('Customers')
        .search({include: ['address']})
        .execute();
    resp.expect
        .toSuccess()
        .toReturnCollection()
        .toHaveFields(['address']);
  })

  it('Should pick fields', async () => {
    const resp = await client.collection('Customers')
        .search({pick: ['id', 'givenName']})
        .execute();
    resp.expect
        .toSuccess()
        .toReturnCollection()
        .toHaveFieldsOnly(['id', 'givenName']);
  })

  it('Should omit fields', async () => {
    const resp = await client.collection('Customers')
        .search({omit: ['id', 'givenName']})
        .execute();
    resp.expect
        .toSuccess()
        .toReturnCollection()
        .not.toHaveFields(['id', 'givenName']);
  })

  it('Should apply filter', async () => {
    const resp = await client.collection('Customers')
        .search({filter: 'countryCode="' + customersData[0].countryCode + '"'})
        .execute();
    resp.expect
        .toSuccess()
        .toReturnCollection()
        .toHaveMinItems(1)
        .toBeFilteredBy('countryCode="' + customersData[0].countryCode + '"');
  })

  it('Should set item limit to be returned', async () => {
    const resp = await client.collection('Customers')
        .search({limit: 3})
        .execute();
    resp.expect
        .toSuccess()
        .toReturnCollection()
        .toHaveMaxItems(3);
  })

  it('Should set offset of the list to be returned', async () => {
    const resp = await client.collection('Customers')
        .search({skip: 10})
        .execute();
    resp.expect
        .toSuccess()
        .toReturnCollection()
        .forEach(x => expect(x.id).toBeGreaterThan(10));
  })

  it('Should count matching records', async () => {
    const resp = await client.collection('Customers')
        .search({count: true})
        .execute();
    resp.expect
        .toSuccess()
        .toReturnCollection();
    expect(resp.headers.has(HttpHeaders.X_Opra_Count)).toBeTruthy();
    expect(resp.headers.get(HttpHeaders.X_Opra_Count)).toStrictEqual('' + customersData.length);
  })

});
