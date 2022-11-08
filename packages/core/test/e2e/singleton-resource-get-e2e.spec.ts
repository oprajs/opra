import express from 'express';
import { OpraDocument } from '@opra/schema';
import { OpraTestClient } from '@opra/testing';
import { OpraExpressAdapter } from '../../src/index.js';
import { createTestDocument } from '../_support/test-app/create-service.js';

describe('e2e: SingletonResource:get', function () {

  let service: OpraDocument;
  let app;
  let client: OpraTestClient;

  beforeAll(async () => {
    service = await createTestDocument();
    app = express();
    await OpraExpressAdapter.init(app, service);
    client = await OpraTestClient.create(app);
  });

  it('Should return object', async () => {
    const resp = await client.singleton('BestCustomer').get();
    resp.expect
        .toSuccess()
        .toReturnObject()
        .toMatch({id: 10})
  });

  // it('Should not send exclusive fields (unless not included for resolver)', async () => {
  //   const resp = await client.collection('Customers')
  //       .get(1)
  //   ;
  //   resp.expect
  //       .toSuccess()
  //       .toReturnObject()
  //       .notToContainKeys(['address', 'notes']);
  // })
  //
  // it('Should pick fields to be returned', async () => {
  //   const resp = await client.collection('Customers')
  //       .get(1)
  //       .pick('id', 'givenName')
  //   ;
  //   resp.expect
  //       .toSuccess()
  //       .toReturnObject()
  //       .toContainKeys(['id', 'givenName']);
  // })
  //
  // it('Should omit fields to be returned', async () => {
  //   const resp = await client.collection('Customers')
  //       .get(1)
  //       .omit('id', 'givenName')
  //   ;
  //   resp.expect
  //       .toSuccess()
  //       .toReturnObject()
  //       .notToContainKeys(['id', 'givenName']);
  // })
  //
  // it('Should include exclusive fields if requested', async () => {
  //   const resp = await client.collection('Customers')
  //       .get('1')
  //       .include('address')
  //   ;
  //   resp.expect
  //       .toSuccess()
  //       .toReturnObject()
  //       .toContainKeys(['address']);
  // })

});
