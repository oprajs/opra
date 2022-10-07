import express from 'express';
import { faker } from '@faker-js/faker';
import { OpraService } from '@opra/schema';
import { apiExpect, opraTest, OpraTester } from '@opra/testing';
import { OpraExpressAdapter } from '../../src/index.js';
import { createTestService } from '../_support/test-app/create-service.js';

describe('e2e: EntityResource:create', function () {

  let service: OpraService;
  let app;
  let api: OpraTester;

  beforeAll(async () => {
    service = await createTestService();
    app = express();
    await OpraExpressAdapter.init(app, service);
    api = opraTest(app);
  });

  it('Should create instance', async () => {
    const data = {
      id: 1001,
      givenName: faker.name.firstName(),
      familyName: faker.name.lastName(),
      gender: 'M',
      address: {city: 'Izmir'}
    }
    let resp = await api.entity('Customers')
        .create(data).send();
    apiExpect(resp)
        .toSuccess()
        .toReturnObject(obj => {
          obj.toMatch({...data, address: undefined});
        });
    resp = await api.entity('Customers')
        .get(1001).send();
    apiExpect(resp)
        .toSuccess()
        .toReturnObject(obj => {
          obj.toMatch({...data, address: undefined});
        });
  })

  it('Should pick fields to be returned', async () => {
    const data = {
      id: 1002,
      givenName: faker.name.firstName(),
      familyName: faker.name.lastName(),
      gender: 'M',
      address: {city: 'Izmir'}
    }
    const resp = await api.entity('Customers')
        .create(data)
        .pick('id', 'givenName')
        .send();
    apiExpect(resp)
        .toSuccess()
        .toReturnObject(obj => {
          obj.toContainAllKeys(['id', 'givenName']);
        })
  })

  it('Should omit fields to be returned', async () => {
    const data = {
      id: 1003,
      givenName: faker.name.firstName(),
      familyName: faker.name.lastName(),
      gender: 'M',
      address: {city: 'Izmir'}
    }
    const resp = await api.entity('Customers')
        .create(data)
        .omit('id', 'givenName')
        .send();
    apiExpect(resp)
        .toSuccess()
        .toReturnObject(obj => {
          obj.notToContainKeys(['id', 'givenName']);
        })
  })

  it('Should include exclusive fields if requested', async () => {
    const data = {
      id: 1004,
      givenName: faker.name.firstName(),
      familyName: faker.name.lastName(),
      gender: 'M',
      address: {city: 'Izmir'}
    }
    const resp = await api.entity('Customers')
        .create(data)
        .include('address')
        .send();
    apiExpect(resp)
        .toSuccess()
        .toReturnObject(obj => {
          obj.toContainKeys(['address']);
        })
  })

});
