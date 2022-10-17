import { faker } from '@faker-js/faker';
import { opraTestClient, OpraTester } from '@opra/testing';
import { createApp, TestApp } from '../_support/app/index.js';

describe('e2e: update', function () {
  let app: TestApp;
  let client: OpraTester;

  beforeAll(async () => {
    app = await createApp();
    client = opraTestClient(app.server);
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
    let resp = await client.entity('Customers')
        .get(100).send();
    resp.expect
        .toSuccess()
        .toReturnObject();
    const oldData = resp.body;

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

