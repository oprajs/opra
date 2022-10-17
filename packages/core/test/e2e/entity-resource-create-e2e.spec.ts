import express from 'express';
import { faker } from '@faker-js/faker';
import { OpraApi } from '@opra/schema';
import { opraTestClient, OpraTester } from '@opra/testing';
import { OpraExpressAdapter } from '../../src/index.js';
import { createTestService } from '../_support/test-app/create-service.js';

describe('e2e: CollectionResource:create', function () {

  let api: OpraApi;
  let app;
  let client: OpraTester;

  beforeAll(async () => {
    api = await createTestService();
    app = express();
    await OpraExpressAdapter.init(app, api);
    client = opraTestClient(app);
  });

  it('Should create instance', async () => {
    const data = {
      id: 1001,
      givenName: faker.name.firstName(),
      familyName: faker.name.lastName(),
      gender: 'M',
      address: {city: 'Izmir'}
    }
    let resp = await client.entity('Customers')
        .create(data).send();
    resp.expect
        .toSuccess(201)
        .toReturnObject()
        .toMatch({...data, address: undefined});
    resp = await client.entity('Customers')
        .get(1001).send();
    resp.expect
        .toSuccess()
        .toReturnObject()
        .toMatch({...data, address: undefined});
  })

  it('Should pick fields to be returned', async () => {
    const data = {
      id: 1002,
      givenName: faker.name.firstName(),
      familyName: faker.name.lastName(),
      gender: 'M',
      address: {city: 'Izmir'}
    }
    const resp = await client.entity('Customers')
        .create(data)
        .pick('id', 'givenName')
        .send();
    resp.expect
        .toSuccess(201)
        .toReturnObject()
        .toContainAllKeys(['id', 'givenName']);
  })

  it('Should omit fields to be returned', async () => {
    const data = {
      id: 1003,
      givenName: faker.name.firstName(),
      familyName: faker.name.lastName(),
      gender: 'M',
      address: {city: 'Izmir'}
    }
    const resp = await client.entity('Customers')
        .create(data)
        .omit('id', 'givenName')
        .send();
    resp.expect
        .toSuccess(201)
        .toReturnObject()
        .notToContainKeys(['id', 'givenName']);
  })

  it('Should include exclusive fields if requested', async () => {
    const data = {
      id: 1004,
      givenName: faker.name.firstName(),
      familyName: faker.name.lastName(),
      gender: 'M',
      address: {city: 'Izmir'}
    }
    const resp = await client.entity('Customers')
        .create(data)
        .include('address')
        .send();
    resp.expect
        .toSuccess(201)
        .toReturnObject()
        .toContainKeys(['address']);
  })

});
