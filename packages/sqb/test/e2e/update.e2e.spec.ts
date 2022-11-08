import { faker } from '@faker-js/faker';
import { OpraTestClient } from '@opra/testing';
import { createApp, TestApp } from '../_support/app/index.js';

describe('e2e: update', function () {
  let app: TestApp;
  let client: OpraTestClient;

  beforeAll(async () => {
    app = await createApp();
    client = await OpraTestClient.create(app.server);
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
        .get(85);
    resp.expect
        .toSuccess()
        .toReturnObject();
    const oldData = resp.data;

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
        .update(oldData.id, data)
        .pick('id', 'givenName');
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
        .update(oldData.id, data)
        .omit('id', 'givenName');
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
        .update(oldData.id, data)
        .include('address');
    resp.expect
        .toSuccess()
        .toReturnObject()
        .toHaveFields(['address']);
  })

});

