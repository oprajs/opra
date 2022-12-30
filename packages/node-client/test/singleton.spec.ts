import bodyParser from 'body-parser';
import express from 'express';
import http from 'http';
import { AddressInfo } from 'net';
import { OpraDocument } from '@opra/common';
import { createTestDocument } from '../../core/test/_support/test-app/create-document.js';
import type { Customer } from '../../core/test/_support/test-app/entities/customer.entity';
import { OpraHttpClient } from '../src/index.js';

describe('OpraClient:Singleton', function () {

  let client: MockClient;
  let document: OpraDocument;
  let server: http.Server;
  let req;

  class MockClient extends OpraHttpClient {
    async init(): Promise<void> {
      this._metadata = document;
    }
  }

  afterAll(() => server.close());

  beforeAll(async () => {
    document = await createTestDocument();
    const app = express();
    app.use(bodyParser.json());
    app.use('*', (_req, _res) => {
      req = _req;
      _res.header('Content-Type', 'application/json');
      _res.end(JSON.stringify({id: 1}));
    });
    await new Promise<void>((subResolve) => {
      server = app.listen(0, '127.0.0.1', () => subResolve());
    }).then(async () => {
      const address = server.address() as AddressInfo;
      client = await MockClient.create('http://127.0.0.1:' + address.port.toString());
    });
  });

  describe('"get" request', function () {
    it('Should send "get" request', async () => {
      await client.singleton<Customer>('BestCustomer')
          .get().fetch();
      expect(req).toBeDefined();
      expect(req.method).toStrictEqual('GET');
      expect(req.baseUrl).toStrictEqual('/BestCustomer');
    });

    it('Should return Observable', (done) => {
      client.singleton<Customer>('BestCustomer').get().subscribe({
        next: () => {
          expect(req).toBeDefined();
          expect(req.method).toStrictEqual('GET');
          expect(req.baseUrl).toStrictEqual('/BestCustomer');
        },
        complete: done,
        error: done
      });
    });

    it('Should send "get" request with "$include" param', async () => {
      await client.singleton('BestCustomer')
          .get({include: ['id', 'givenName']}).fetch();
      expect(req).toBeDefined();
      expect(req.method).toStrictEqual('GET');
      expect(req.baseUrl).toStrictEqual('/BestCustomer');
      expect(Object.keys(req.query)).toStrictEqual(['$include']);
      expect(req.query.$include).toStrictEqual('id,givenName');
    });

    it('Should send "get" request with "$pick" param', async () => {
      await client.singleton('BestCustomer')
          .get({pick: ['id', 'givenName']}).fetch();
      expect(req).toBeDefined();
      expect(req.method).toStrictEqual('GET');
      expect(req.baseUrl).toStrictEqual('/BestCustomer');
      expect(Object.keys(req.query)).toStrictEqual(['$pick']);
      expect(req.query.$pick).toStrictEqual('id,givenName');
    });

    it('Should send "get" request with "$omit" param', async () => {
      await client.singleton('BestCustomer')
          .get({omit: ['id', 'givenName']}).fetch();
      expect(req).toBeDefined();
      expect(req.method).toStrictEqual('GET');
      expect(req.baseUrl).toStrictEqual('/BestCustomer');
      expect(Object.keys(req.query)).toStrictEqual(['$omit']);
      expect(req.query.$omit).toStrictEqual('id,givenName');
    });
  })

});
