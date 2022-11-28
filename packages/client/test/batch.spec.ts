// import * as axiosist from 'axiosist';
// import bodyParser from 'body-parser';
// import express from 'express';
// // import { lastValueFrom } from 'rxjs';
// import { OpraDocument } from '@opra/schema';
// import { createTestDocument } from '../../core/test/_support/test-app/create-document.js';
// // import type { Customer } from '../../core/test/_support/test-app/entities/customer.entity.js';
// // import { CustomerNotes } from '../../core/test/_support/test-app/entities/customer-notes.entity.js';
// import { OpraClient } from '../src/index.js';

describe('OpraClient:Batch', function () {

  // let client: MockClient;
  // let document: OpraDocument;
  //
  // class MockClient extends OpraClient {
  //   async init(): Promise<void> {
  //     this._metadata = document;
  //   }
  // }

  beforeAll(async () => {
    // document = await createTestDocument();
    // const app = express();
    // app.use(bodyParser.text({type: 'multipart/mixed'}));
    // app.use('*', (req, res) => {
    //   res.end(req.body);
    // })
    // client = await MockClient.create('http://localhost', {adapter: axiosist.createAdapter(app)});
  });

  it('Should send "batch" request', async () => {
    return;
    // let customer1req;
    // const res = await client.batch([
    //   customer1req = client.collection<Customer>('Customers').get(1),
    //   client.collection<CustomerNotes>('CustomerNotes').create({
    //     title: 'test1',
    //     customerId: customer1req.binding().id
    //   })
    // ]).execute();
    //
    // const customer1resp = await lastValueFrom(customer1req);

    // expect(req).toBeDefined();
    // expect(req.method).toStrictEqual('POST');
    // expect(req.url).toStrictEqual(client.serviceUrl + '/$batch');
    // expect(customer1resp).toStrictEqual(1);
    // expect(req.headers?.['content-type']).toMatch(/^opra_batch_(.+)$/);
  });

});
