import express from 'express';
import { faker } from '@faker-js/faker';
import { OpraDocument } from '@opra/schema';
import { OpraTestClient } from '@opra/testing';
import { OpraExpressAdapter } from '../../src/index.js';
import { createTestDocument } from '../_support/test-app/create-service.js';

describe('e2e: CollectionResource:create', function () {

  let api: OpraDocument;
  let app;
  let client: OpraTestClient;

  beforeAll(async () => {
    api = await createTestDocument();
    app = express();
    await OpraExpressAdapter.init(app, api);
    client = await OpraTestClient.create(app);
  });

  it('Should create instance', async () => {
    const data = {
      id: 1001,
      givenName: faker.name.firstName(),
      familyName: faker.name.lastName(),
      gender: 'M',
      address: {city: 'Izmir'}
    }
    let resp = await client.collection('Customers')
        .create(data);
    resp.expect
        .toSuccess(201)
        .toReturnObject()
        .toMatch({...data, address: undefined});
    resp = await client.collection('Customers')
        .get(1001);
    resp.expect
        .toSuccess()
        .toReturnObject()
        .toMatch({...data, address: undefined});
  })

  it('Should not send exclusive fields by default', async () => {
    const data = {
      id: 1004,
      givenName: faker.name.firstName(),
      familyName: faker.name.lastName(),
      gender: 'M',
      address: {city: 'Izmir'}
    }
    const resp = await client.collection('Customers')
        .create(data, {include: ['address']});
    resp.expect
        .toSuccess(201)
        .toReturnObject()
        .toHaveFields(['address']);
  })

  it('Should pick fields to be returned', async () => {
    const data = {
      id: 1002,
      givenName: faker.name.firstName(),
      familyName: faker.name.lastName(),
      gender: 'M',
      address: {city: 'Izmir'}
    }
    const resp = await client.collection('Customers')
        .create(data, {pick: ['id', 'givenName']});
    resp.expect
        .toSuccess(201)
        .toReturnObject()
        .toHaveFieldsOnly(['id', 'givenName']);
  })

  it('Should omit fields to be returned', async () => {
    const data = {
      id: 1003,
      givenName: faker.name.firstName(),
      familyName: faker.name.lastName(),
      gender: 'M',
      address: {city: 'Izmir'}
    }
    const resp = await client.collection('Customers')
        .create(data, {omit: ['id', 'givenName']});
    resp.expect
        .toSuccess(201)
        .toReturnObject()
        .not.toHaveFields(['id', 'givenName']);
  })


});
