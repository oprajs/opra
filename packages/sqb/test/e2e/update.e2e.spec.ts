import { faker } from '@faker-js/faker';
import { OpraTestClient } from '@opra/testing';
import { createApp, TestApp } from '../_support/app/index.js';

describe('e2e: update', function () {
  let app: TestApp;
  let client: OpraTestClient;

  beforeAll(async () => {
    app = await createApp();
    client = new OpraTestClient(app.server, {document: app.document});
  });

  afterAll(async () => {
    await app?.db.close(0);
  })


  it('Should update instance', async () => {
    const data = {
      givenName: faker.name.firstName(),
      familyName: faker.name.lastName(),
      gender: 'M',
      address: {city: 'Izmir'}
    }
    let resp = await client.collection('Customers')
        .get(85)
        .fetch('response');
    resp.expect
        .toSuccess()
        .toReturnObject();
    const oldData = resp.body;

    resp = await client.collection('Customers')
        .update(oldData.id, data)
        .fetch('response');
    resp.expect
        .toSuccess()
        .toReturnObject()
        .toMatch({...oldData, ...data, address: undefined});

    resp = await client.collection('Customers')
        .get(oldData.id)
        .fetch('response');
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
        .fetch('response');
    const oldData = resp.body;
    resp.expect
        .toSuccess()
        .toReturnObject();

    resp = await client.collection('Customers')
        .update(oldData.id, data, {pick: ['id', 'givenName']})
        .fetch('response');
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
        .fetch('response');
    const oldData = resp.body;
    resp.expect
        .toSuccess()
        .toReturnObject();

    resp = await client.collection('Customers')
        .update(oldData.id, data, {omit: ['id', 'givenName']})
        .fetch('response');
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
        .fetch('response');
    const oldData = resp.body;
    resp.expect
        .toSuccess()
        .toReturnObject();

    resp = await client.collection('Customers')
        .update(oldData.id, data, {include: ['address']})
        .fetch('response');
    resp.expect
        .toSuccess()
        .toReturnObject()
        .toHaveFields(['address']);
  })

});
