import { opraTestClient, OpraTester } from '@opra/testing';
import { createApp, TestApp } from '../_support/app/index.js';

describe('e2e: get', function () {
  let app: TestApp;
  let client: OpraTester;

  beforeAll(async () => {
    app = await createApp();
    client = opraTestClient(app.server);
  });

  afterAll(async () => {
    await app?.db.close(0);
  })

  it('Should return object', async () => {
    const resp = await client.entity('Customers')
        .get(1)
        .send();
    resp.expect
        .toSuccess()
        .toReturnObject()
        .toMatch({id: 1})
  });

  it('Should return object', async () => {
    const resp = await client.entity('Customers')
        .get(1).send();
    resp.expect
        .toSuccess()
        .toReturnObject()
        .toMatch({id: 1})
  })

  it('Should not send exclusive fields (unless not included for resolver)', async () => {
    const resp = await client.entity('Customers')
        .get(1)
        .send();
    resp.expect
        .toSuccess()
        .toReturnObject()
        .notToContainKeys(['address', 'notes']);
  })

  it('Should pick fields to be returned', async () => {
    const resp = await client.entity('Customers')
        .get(1)
        .pick('id', 'givenName')
        .send();
    resp.expect
        .toSuccess()
        .toReturnObject()
        .toContainKeys(['id', 'givenName']);
  })

  it('Should omit fields to be returned', async () => {
    const resp = await client.entity('Customers')
        .get(1)
        .omit('id', 'givenName')
        .send();
    resp.expect
        .toSuccess()
        .toReturnObject()
        .notToContainKeys(['id', 'givenName']);
  })

  it('Should include exclusive fields if requested', async () => {
    const resp = await client.entity('Customers')
        .get(1)
        .include('notes')
        .send();
    resp.expect
        .toSuccess()
        .toReturnObject()
        .toContainKeys(['notes']);
    expect(resp.body.notes).toBeArray();
  })

});

