import * as axiosist from 'axiosist';
import bodyParser from 'body-parser';
import express from 'express';
import { OpraDocument } from '@opra/schema';
import { createTestDocument } from '../../core/test/_support/test-app/create-document.js';
import type { Customer } from '../../core/test/_support/test-app/entities/customer.entity';
import { OpraClient } from '../src/client.js';

describe('OpraClient:Singleton', function () {

  let client: MockClient;
  let document: OpraDocument;
  let req;

  class MockClient extends OpraClient {
    async init(): Promise<void> {
      this._metadata = document;
    }
  }

  beforeAll(async () => {
    document = await createTestDocument();
    const app = express();
    app.use(bodyParser.json());
    app.use('*', (_req, _res) => {
      req = _req;
      _res.end();
    })
    client = await MockClient.create('http://localhost', {
      adapter: axiosist.createAdapter(app)
    });
  });

  describe('"get" request', function () {
    it('Should send "get" request', async () => {
      await client.singleton<Customer>('BestCustomer')
          .get().execute();
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
          .get({include: ['id', 'givenName']}).execute();
      expect(req).toBeDefined();
      expect(req.method).toStrictEqual('GET');
      expect(req.baseUrl).toStrictEqual('/BestCustomer');
      expect(Object.keys(req.query)).toStrictEqual(['$include']);
      expect(req.query.$include).toStrictEqual('id,givenName');
    });

    it('Should send "get" request with "$pick" param', async () => {
      await client.singleton('BestCustomer')
          .get({pick: ['id', 'givenName']}).execute();
      expect(req).toBeDefined();
      expect(req.method).toStrictEqual('GET');
      expect(req.baseUrl).toStrictEqual('/BestCustomer');
      expect(Object.keys(req.query)).toStrictEqual(['$pick']);
      expect(req.query.$pick).toStrictEqual('id,givenName');
    });

    it('Should send "get" request with "$omit" param', async () => {
      await client.singleton('BestCustomer')
          .get({omit: ['id', 'givenName']}).execute();
      expect(req).toBeDefined();
      expect(req.method).toStrictEqual('GET');
      expect(req.baseUrl).toStrictEqual('/BestCustomer');
      expect(Object.keys(req.query)).toStrictEqual(['$omit']);
      expect(req.query.$omit).toStrictEqual('id,givenName');
    });
  })

});
