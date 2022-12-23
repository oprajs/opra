import bodyParser from 'body-parser';
import express, { Request } from 'express';
import * as http from 'http';
import { AddressInfo } from 'net';
import { OpraDocument } from '@opra/common';
import { createTestDocument } from '../../core/test/_support/test-app/create-document.js';
import type { Customer } from '../../core/test/_support/test-app/entities/customer.entity.js';
import { CustomerNotes } from '../../core/test/_support/test-app/entities/customer-notes.entity.js';
import { HttpRequest, OpraHttpClient } from '../src/index.js';

describe('OpraClient:Batch', function () {

  let client: MockClient;
  let document: OpraDocument;
  let server: http.Server;
  let requests: Request[];

  class MockClient extends OpraHttpClient {
    async init(): Promise<void> {
      this._metadata = document;
    }
  }

  afterAll(() => server.close());

  beforeAll(async () => {
    document = await createTestDocument();
    const app = express();
    app.use(bodyParser.text({type: 'multipart/mixed'}));
    app.use('*', (_req, _res) => {
      requests.push(_req);
      _res.end();
    });
    await new Promise<void>((subResolve) => {
      server = app.listen(0, '127.0.0.1', () => subResolve());
    }).then(async () => {
      const address = server.address() as AddressInfo;
      client = await MockClient.create('http://127.0.0.1:' + address.port.toString());
    });
  });

  beforeEach(() => requests = []);

  it('Should send "batch" request', async () => {
    let customer1req: HttpRequest;
    await client.batch([
      customer1req = client.collection<Customer>('Customers')
          .get(1, {http: {headers: {'accept': 'application/json'}}}),
      client.collection<CustomerNotes>('CustomerNotes').create({
        title: 'test1',
        customerId: customer1req.binding().id
      })
    ]).fetch();

    expect(requests.length).toStrictEqual(1);
    const req = requests[0];
    expect(req).toBeDefined();
    expect(req.method).toStrictEqual('POST');
    expect(req.baseUrl).toStrictEqual('/$batch');
    expect(req.headers?.['content-type']).toMatch('multipart/mixed');
  });

  it('Should not send sub request even call "subscribe" or "onFinish"', async () => {
    let customer1req: HttpRequest;
    await client.batch([
      customer1req = client.collection<Customer>('Customers')
          .get(1, {http: {headers: {'accept': 'application/json'}}})
          .with(_this => _this.subscribe(() => void 0)),
      client.collection<CustomerNotes>('CustomerNotes').create({
        title: 'test1',
        customerId: customer1req.binding().id
      }).with(_this => _this.subscribe(() => void 0))
    ]).fetch();

    expect(requests.length).toStrictEqual(1);
    const req = requests[0];
    expect(req).toBeDefined();
    expect(req.method).toStrictEqual('POST');
    expect(req.baseUrl).toStrictEqual('/$batch');
    expect(req.headers?.['content-type']).toMatch('multipart/mixed');
  });

});
