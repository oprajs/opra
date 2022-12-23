import express from 'express';
import { faker } from '@faker-js/faker';
import { OpraDocument } from '@opra/common';
import { OpraTestClient } from '@opra/testing';
import { OpraExpressAdapter } from '../../src/index.js';
import { createTestDocument } from '../_support/test-app/create-document.js';

describe('e2e: CollectionResource:update', function () {

  let document: OpraDocument;
  let app;
  let client: OpraTestClient;

  beforeAll(async () => {
    document = await createTestDocument();
    app = express();
    await OpraExpressAdapter.init(app, document);
    client = new OpraTestClient(app, {document});
  });

  it('Should update instance', async () => {
    const data = {
      givenName: faker.name.firstName(),
      familyName: faker.name.lastName(),
      gender: 'M',
      address: {city: 'Izmir'}
    }
    let resp = await client.collection('Customers')
        .get(100)
        .fetch();
    const oldData = resp.data;
    resp.expect
        .toSuccess()
        .toReturnObject();

    resp = await client.collection('Customers')
        .update(oldData.id, data)
        .fetch();
    resp.expect
        .toSuccess()
        .toReturnObject()
        .toMatch({...oldData, ...data, address: undefined});

    resp = await client.collection('Customers')
        .get(oldData.id)
        .fetch();
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
        .get(100)
        .fetch();
    const oldData = resp.data;
    resp.expect
        .toSuccess()
        .toReturnObject();

    resp = await client.collection('Customers')
        .update(oldData.id, data, {pick: ['id', 'givenName']})
        .fetch();
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
        .get(100)
        .fetch();
    const oldData = resp.data;
    resp.expect
        .toSuccess()
        .toReturnObject();

    resp = await client.collection('Customers')
        .update(oldData.id, data, {omit: ['id', 'givenName']})
        .fetch();
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
        .get(100)
        .fetch();
    const oldData = resp.data;
    resp.expect
        .toSuccess()
        .toReturnObject();

    resp = await client.collection('Customers')
        .update(oldData.id, data, {include: ['address']})
        .fetch();
    resp.expect
        .toSuccess()
        .toReturnObject()
        .toHaveFields(['address']);
  })

});
