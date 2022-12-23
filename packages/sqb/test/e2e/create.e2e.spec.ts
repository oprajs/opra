import { faker } from '@faker-js/faker';
import { OpraTestClient } from '@opra/testing';
import { createApp, TestApp } from '../_support/app/index.js';

describe('e2e: create', function () {
  let app: TestApp;
  let client: OpraTestClient;

  beforeAll(async () => {
    app = await createApp();
    client = await OpraTestClient.create(app.server);
  });

  afterAll(async () => {
    await app?.db.close(0);
  })

  it('Should create instance', async () => {
    const data = {
      id: 1001,
      givenName: faker.name.firstName(),
      familyName: faker.name.lastName(),
      gender: 'M',
      address: {city: 'Izmir'}
    }
    let resp = await client.collection('Customers')
        .create(data)
        .fetch();
    resp.expect
        .toSuccess(201)
        .toReturnObject()
        .toMatch({...data, address: undefined});
    resp = await client.collection('Customers')
        .get(1001)
        .fetch();
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
    const resp = await client.collection('Customers')
        .create(data, {pick: ['id', 'givenName']})
        .fetch();
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
        .create(data, {omit: ['id', 'givenName']})
        .fetch();
    resp.expect
        .toSuccess(201)
        .toReturnObject()
        .not.toHaveFields(['id', 'givenName']);
  })

  it('Should include exclusive fields if requested', async () => {
    const data = {
      id: 1004,
      givenName: faker.name.firstName(),
      familyName: faker.name.lastName(),
      countryCode: 'TR',
      gender: 'M',
      address: {city: 'Izmir', countryCode: 'TR',}
    }
    const resp = await client.collection('Customers')
        .create(data, {include: ['address']})
        .fetch();
    resp.expect
        .toSuccess(201)
        .toReturnObject()
        .toHaveFields(['address']);
  })

});

