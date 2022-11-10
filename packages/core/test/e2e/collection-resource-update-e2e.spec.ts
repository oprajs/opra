import express from 'express';
import { faker } from '@faker-js/faker';
import { OpraDocument } from '@opra/schema';
import { OpraTestClient } from '@opra/testing';
import { OpraExpressAdapter } from '../../src/index.js';
import { createTestDocument } from '../_support/test-app/create-service.js';

describe('e2e: CollectionResource:update', function () {

  let service: OpraDocument;
  let app;
  let client: OpraTestClient;

  beforeAll(async () => {
    service = await createTestDocument();
    app = express();
    await OpraExpressAdapter.init(app, service);
    client = await OpraTestClient.create(app);
  });

  it('Should update instance', async () => {
    const data = {
      givenName: faker.name.firstName(),
      familyName: faker.name.lastName(),
      gender: 'M',
      address: {city: 'Izmir'}
    }
    let resp = await client.collection('Customers')
        .get(100);
    const oldData = resp.data;
    resp.expect
        .toSuccess()
        .toReturnObject();

    resp = await client.collection('Customers')
        .update(oldData.id, data);
    resp.expect
        .toSuccess()
        .toReturnObject()
        .toMatch({...oldData, ...data, address: undefined});

    resp = await client.collection('Customers')
        .get(oldData.id);
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
    let resp = await client.collection('Customers')
        .get(100);
    const oldData = resp.data;
    resp.expect
        .toSuccess()
        .toReturnObject();

    resp = await client.collection('Customers')
        .update(oldData.id, data, {pick: ['id', 'givenName']});
    resp.expect
        .toSuccess()
        .toReturnObject()
        .toHaveFieldsOnly(['id', 'givenName']);
  })

  it('Should omit fields to be returned', async () => {
    const data = {
      givenName: faker.name.firstName(),
      familyName: faker.name.lastName(),
      gender: 'M',
      address: {city: 'Izmir'}
    }
    let resp = await client.collection('Customers')
        .get(100);
    const oldData = resp.data;
    resp.expect
        .toSuccess()
        .toReturnObject();

    resp = await client.collection('Customers')
        .update(oldData.id, data, {omit: ['id', 'givenName']});
    resp.expect
        .toSuccess()
        .toReturnObject()
        .not.toHaveFields(['id', 'givenName']);
  })

  it('Should include exclusive fields if requested', async () => {
    const data = {
      givenName: faker.name.firstName(),
      familyName: faker.name.lastName(),
      gender: 'M',
      address: {city: 'Izmir'}
    }
    let resp = await client.collection('Customers')
        .get(100);
    const oldData = resp.data;
    resp.expect
        .toSuccess()
        .toReturnObject();

    resp = await client.collection('Customers')
        .update(oldData.id, data, {include: ['address']});
    resp.expect
        .toSuccess()
        .toReturnObject()
        .toHaveFields(['address']);
  })

});
