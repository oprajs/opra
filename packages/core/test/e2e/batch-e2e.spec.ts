// import express from 'express';
// import { OpraDocument } from '@opra/common';
// import { OpraTestClient } from '@opra/testing';
// import { OpraExpressAdapter } from '../../src/index.js';
// import { createTestDocument } from '../_support/test-app/create-document.js';

describe('Batch', function () {
  it('Skip', async () => {
    //
  })
});
// describe('Batch', function () {
//   let document: OpraDocument;
//   let app;
//   let client: OpraTestClient;
//
//   beforeAll(async () => {
//     document = await createTestDocument();
//     app = express();
//     await OpraExpressAdapter.init(app, document);
//     client = new OpraTestClient(app, document);
//   });
//
//   it.only('Should execute batch request in a single ExecutionContext', async () => {
//     return;
// // todo
//     const resp = await client.batch([
//       client.collection('Customers')
//           .get(1)
//           .header('accept', 'application/json')
//           .onFinish((res) => {
//             res.expect
//                 .toSuccess()
//                 .toReturnObject()
//                 .toMatch({id: 1})
//           }),
//       client.collection('Customers')
//           .get(2)
//           .header('accept-language', 'tr, en-GB;q=0.8, en;q=0.7')
//           .onFinish((res) => {
//             res.expect
//                 .toSuccess()
//                 .toReturnObject()
//                 .toMatch({id: 2})
//           }),
//     ]).toPromise();
//     resp.expect.toSuccess();
//     expect(resp.headers?.['content-type']).toMatch('multipart/mixed');
//   })
//
// });
