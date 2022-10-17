import express from 'express';
import { faker } from '@faker-js/faker';
import { OpraApi } from '@opra/schema';
import { opraTestClient, OpraTester } from '@opra/testing';
import { OpraExpressAdapter } from '../../src/index.js';
import { createTestService } from '../_support/test-app/create-service.js';

describe('e2e: EntityResource:update', function () {

  let service: OpraApi;
  let app;
  let client: OpraTester;

  beforeAll(async () => {
    service = await createTestService();
    app = express();
    await OpraExpressAdapter.init(app, service);
    client = opraTestClient(app);
  });

  it('Should update instance', async () => {
    const data = {
      givenName: faker.name.firstName(),
      familyName: faker.name.lastName(),
      gender: 'M',
      address: {city: 'Izmir'}
    }
    let resp = await client.entity('Customers')
        .get(100).send();
    const oldData = resp.body;
    resp.expect
        .toSuccess()
        .toReturnObject();

    resp = await client.entity('Customers')
        .update(oldData.id, data).send();
    resp.expect
        .toSuccess()
        .toReturnObject()
        .toMatch({...oldData, ...data, address: undefined});

    resp = await client.entity('Customers')
        .get(oldData.id).send();
    resp.expect
        .toSuccess()
        .toReturnObject()
        .toMatch({...oldData, ...data, address: undefined});
  })

  it('Should pick fields to be returned', async () => {
    const data = {
      givenName: faker.name.firstName(),
      familyName: faker.name.lastName(),
      gender: 'M',
      address: {city: 'Izmir'}
    }
    let resp = await client.entity('Customers')
        .get(100).send();
    const oldData = resp.body;
    resp.expect
        .toSuccess()
        .toReturnObject();

    resp = await client.entity('Customers')
        .update(oldData.id, data)
        .pick('id', 'givenName')
        .send();
    resp.expect
        .toSuccess()
        .toReturnObject()
        .toContainAllKeys(['id', 'givenName']);
  })

  it('Should omit fields to be returned', async () => {
    const data = {
      givenName: faker.name.firstName(),
      familyName: faker.name.lastName(),
      gender: 'M',
      address: {city: 'Izmir'}
    }
    let resp = await client.entity('Customers')
        .get(100).send();
    const oldData = resp.body;
    resp.expect
        .toSuccess()
        .toReturnObject();

    resp = await client.entity('Customers')
        .update(oldData.id, data)
        .omit('id', 'givenName')
        .send();
    resp.expect
        .toSuccess()
        .toReturnObject()
        .notToContainKeys(['id', 'givenName']);
  })

  it('Should include exclusive fields if requested', async () => {
    const data = {
      givenName: faker.name.firstName(),
      familyName: faker.name.lastName(),
      gender: 'M',
      address: {city: 'Izmir'}
    }
    let resp = await client.entity('Customers')
        .get(100).send();
    const oldData = resp.body;
    resp.expect
        .toSuccess()
        .toReturnObject();

    resp = await client.entity('Customers')
        .update(oldData.id, data)
        .include('address')
        .send();
    resp.expect
        .toSuccess()
        .toReturnObject()
        .toContainKeys(['address']);
  })

});
