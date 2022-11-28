import { OpraTestClient } from '@opra/testing';
import { createApp, TestApp } from '../_support/app/index.js';

describe('e2e: get', function () {
  let app: TestApp;
  let client: OpraTestClient;

  beforeAll(async () => {
    app = await createApp();
    client = await OpraTestClient.create(app.server);
  });

  afterAll(async () => {
    await app?.db.close(0);
  })

  it('Should return object', async () => {
    const resp = await client.collection('Customers')
        .get(1)
        .execute();
    resp.expect
        .toSuccess()
        .toReturnObject()
        .toMatch({id: 1})
  });

  it('Should return object', async () => {
    const resp = await client.collection('Customers')
        .get(1)
        .execute();
    resp.expect
        .toSuccess()
        .toReturnObject()
        .toMatch({id: 1})
  })

  it('Should not send exclusive fields (unless not included for resolver)', async () => {
    const resp = await client.collection('Customers')
        .get(1)
        .execute();
    resp.expect
        .toSuccess()
        .toReturnObject()
        .not.toHaveFields(['address', 'notes']);
  })

  it('Should pick fields to be returned', async () => {
    const resp = await client.collection('Customers')
        .get(1, {pick: ['id', 'givenName']})
        .execute();
    resp.expect
        .toSuccess()
        .toReturnObject()
        .toHaveFields(['id', 'givenName']);
  })

  it('Should omit fields to be returned', async () => {
    const resp = await client.collection('Customers')
        .get(1, {omit: ['id', 'givenName']})
        .execute();
    resp.expect
        .toSuccess()
        .toReturnObject()
        .not.toHaveFields(['id', 'givenName']);
  })

  it('Should include exclusive fields if requested', async () => {
    const resp = await client.collection('Customers')
        .get(2, {include: ['notes']})
        .execute();
    resp.expect
        .toSuccess()
        .toReturnObject()
        .toHaveFields(['notes']);
    expect(resp.data.notes).toBeArray();
  })

});

