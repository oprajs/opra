import * as axiosist from 'axiosist';
import bodyParser from 'body-parser';
import express from 'express';
import type { Customer } from '@opra/core/test/_support/test-app/entities/customer.entity';
import { OpraDocument } from '@opra/schema';
import { createTestDocument } from '../../core/test/_support/test-app/create-document.js';
import { OpraClient } from '../src/client.js';

describe('OpraClient:Collection', function () {

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

  describe('"create" request', function () {
    const data = {id: 1, givenName: 'dfd'};

    it('Should send "create" request (promise)', async () => {
      await client.collection<Customer>('Customers')
          .create(data).execute();
      expect(req).toBeDefined();
      expect(req.method).toStrictEqual('POST');
      expect(req.baseUrl).toStrictEqual('/Customers');
      expect(req.body).toStrictEqual(data);
    });

    it('Should return Observable', (done) => {
      client.collection<Customer>('Customers').create(data).subscribe({
        next: () => {
          expect(req).toBeDefined();
          expect(req.method).toStrictEqual('POST');
          expect(req.baseUrl).toStrictEqual('/Customers');
          expect(req.body).toStrictEqual(data);
        },
        complete: done,
        error: done
      });
    });

    it('Should send "create" request with "$include" param', async () => {
      await client.collection('Customers').create(data, {include: ['id', 'givenName']}).execute();
      expect(req).toBeDefined();
      expect(req.method).toStrictEqual('POST');
      expect(req.baseUrl).toStrictEqual('/Customers');
      expect(req.body).toStrictEqual(data);
      expect(Object.keys(req.query)).toStrictEqual(['$include']);
      expect(req.query.$include).toStrictEqual('id,givenName');
    });

    it('Should send "create" request with "$pick" param', async () => {
      await client.collection('Customers')
          .create(data, {pick: ['id', 'givenName']}).execute();
      expect(req).toBeDefined();
      expect(req.method).toStrictEqual('POST');
      expect(req.baseUrl).toStrictEqual('/Customers');
      expect(req.body).toStrictEqual(data);
      expect(Object.keys(req.query)).toStrictEqual(['$pick']);
      expect(req.query.$pick).toStrictEqual('id,givenName');
    });

    it('Should send "create" request with "$omit" param', async () => {
      await client.collection('Customers')
          .create(data, {omit: ['id', 'givenName']}).execute();
      expect(req).toBeDefined();
      expect(req.method).toStrictEqual('POST');
      expect(req.baseUrl).toStrictEqual('/Customers');
      expect(req.body).toStrictEqual(data);
      expect(Object.keys(req.query)).toStrictEqual(['$omit']);
      expect(req.query.$omit).toStrictEqual('id,givenName');
    });
  })


  describe('"delete" request', function () {
    it('Should send "delete" request', async () => {
      await client.collection('Customers')
          .delete(1).execute();
      expect(req).toBeDefined();
      expect(req.method).toStrictEqual('DELETE');
      expect(req.baseUrl).toStrictEqual('/Customers@1');
    });

    it('Should return Observable', (done) => {
      client.collection<Customer>('Customers').delete(1).subscribe({
        next: () => {
          expect(req).toBeDefined();
          expect(req.method).toStrictEqual('DELETE');
          expect(req.baseUrl).toStrictEqual('/Customers@1');
        },
        complete: done,
        error: done
      });
    });

    it('Should send "delete" request with multiple keys', async () => {
      await client.collection('Customers')
          .delete({id: 1, active: true}).execute();
      expect(req).toBeDefined();
      expect(req.method).toStrictEqual('DELETE');
      expect(req.baseUrl).toStrictEqual('/Customers@id=1;active=true');
    });

  })


  describe('"deleteMany" request', function () {

    it('Should send "deleteMany" request', async () => {
      await client.collection('Customers')
          .deleteMany().execute();
      expect(req).toBeDefined();
      expect(req.method).toStrictEqual('DELETE');
      expect(req.baseUrl).toStrictEqual('/Customers');
    });

    it('Should return Observable', (done) => {
      client.collection<Customer>('Customers').deleteMany().subscribe({
        next: () => {
          expect(req).toBeDefined();
          expect(req.method).toStrictEqual('DELETE');
          expect(req.baseUrl).toStrictEqual('/Customers');
        },
        complete: done,
        error: done
      });
    });

    it('Should send "deleteMany" request with "$filter" param', async () => {
      await client.collection('Customers')
          .deleteMany({filter: 'id=1'}).execute();
      expect(req).toBeDefined();
      expect(req.method).toStrictEqual('DELETE');
      expect(req.baseUrl).toStrictEqual('/Customers');
      expect(Object.keys(req.query)).toStrictEqual(['$filter']);
      expect(req.query.$filter).toStrictEqual('id=1');
    });
  })


  describe('"get" request', function () {

    it('Should send "get" request', async () => {
      await client.collection<Customer>('Customers')
          .get(1).execute();
      expect(req).toBeDefined();
      expect(req.method).toStrictEqual('GET');
      expect(req.baseUrl).toStrictEqual('/Customers@1');
    });

    it('Should return Observable', (done) => {
      client.collection<Customer>('Customers').get(1).subscribe({
        next: () => {
          expect(req).toBeDefined();
          expect(req.method).toStrictEqual('GET');
          expect(req.baseUrl).toStrictEqual('/Customers@1');
        },
        complete: done,
        error: done
      });
    });

    it('Should send "get" request with "$include" param', async () => {
      await client.collection('Customers')
          .get(1, {include: ['id', 'givenName']}).execute();
      expect(req).toBeDefined();
      expect(req.method).toStrictEqual('GET');
      expect(req.baseUrl).toStrictEqual('/Customers@1');
      expect(Object.keys(req.query)).toStrictEqual(['$include']);
      expect(req.query.$include).toStrictEqual('id,givenName');
    });

    it('Should send "get" request with "$pick" param', async () => {
      await client.collection('Customers')
          .get(1, {pick: ['id', 'givenName']}).execute();
      expect(req).toBeDefined();
      expect(req.method).toStrictEqual('GET');
      expect(req.baseUrl).toStrictEqual('/Customers@1');
      expect(Object.keys(req.query)).toStrictEqual(['$pick']);
      expect(req.query.$pick).toStrictEqual('id,givenName');
    });

    it('Should send "get" request with "$omit" param', async () => {
      await client.collection('Customers')
          .get(1, {omit: ['id', 'givenName']}).execute();
      expect(req).toBeDefined();
      expect(req.method).toStrictEqual('GET');
      expect(req.baseUrl).toStrictEqual('/Customers@1');
      expect(Object.keys(req.query)).toStrictEqual(['$omit']);
      expect(req.query.$omit).toStrictEqual('id,givenName');
    });
  })


  describe('"search" request', function () {

    it('Should send "search" request', async () => {
      await client.collection<Customer>('Customers')
          .search().execute();
      expect(req).toBeDefined();
      expect(req.method).toStrictEqual('GET');
      expect(req.baseUrl).toStrictEqual('/Customers');
    });

    it('Should return Observable', (done) => {
      client.collection<Customer>('Customers').search().subscribe({
        next: () => {
          expect(req).toBeDefined();
          expect(req.method).toStrictEqual('GET');
          expect(req.baseUrl).toStrictEqual('/Customers');
        },
        complete: done,
        error: done
      });
    });

    it('Should send "search" request with "$include" param', async () => {
      await client.collection('Customers')
          .search({
            include: ['id', 'givenName']
          }).execute();
      expect(req).toBeDefined();
      expect(req.method).toStrictEqual('GET');
      expect(req.baseUrl).toStrictEqual('/Customers');
      expect(Object.keys(req.query)).toStrictEqual(['$include']);
      expect(req.query.$include).toStrictEqual('id,givenName');
    });

    it('Should send "search" request with "$pick" param', async () => {
      await client.collection('Customers')
          .search({
            pick: ['id', 'givenName']
          }).execute();
      expect(req).toBeDefined();
      expect(req.method).toStrictEqual('GET');
      expect(req.baseUrl).toStrictEqual('/Customers');
      expect(Object.keys(req.query)).toStrictEqual(['$pick']);
      expect(req.query.$pick).toStrictEqual('id,givenName');
    });

    it('Should send "search" request with "$omit" param', async () => {
      await client.collection('Customers')
          .search({
            omit: ['id', 'givenName']
          }).execute();
      expect(req).toBeDefined();
      expect(req.method).toStrictEqual('GET');
      expect(req.baseUrl).toStrictEqual('/Customers');
      expect(Object.keys(req.query)).toStrictEqual(['$omit']);
      expect(req.query.$omit).toStrictEqual('id,givenName');
    });

    it('Should send "search" request with "$sort" param', async () => {
      await client.collection('Customers')
          .search({
            sort: ['id', 'givenName']
          }).execute();
      expect(req).toBeDefined();
      expect(req.method).toStrictEqual('GET');
      expect(req.baseUrl).toStrictEqual('/Customers');
      expect(Object.keys(req.query)).toStrictEqual(['$sort']);
      expect(req.query.$sort).toStrictEqual('id,givenName');
    });

    it('Should send "search" request with "$filter" param', async () => {
      await client.collection('Customers')
          .search({
            filter: 'id=1'
          }).execute();
      expect(req).toBeDefined();
      expect(req.method).toStrictEqual('GET');
      expect(req.baseUrl).toStrictEqual('/Customers');
      expect(Object.keys(req.query)).toStrictEqual(['$filter']);
      expect(req.query.$filter).toStrictEqual('id=1');
    });

    it('Should send "search" request with "$limit" param', async () => {
      await client.collection('Customers')
          .search({
            limit: 5
          }).execute();
      expect(req).toBeDefined();
      expect(req.method).toStrictEqual('GET');
      expect(req.baseUrl).toStrictEqual('/Customers');
      expect(Object.keys(req.query)).toStrictEqual(['$limit']);
      expect(req.query.$limit).toStrictEqual('5');
    });

    it('Should send "search" request with "$skip" param', async () => {
      await client.collection('Customers')
          .search({
            skip: 5
          }).execute();
      expect(req).toBeDefined();
      expect(req.method).toStrictEqual('GET');
      expect(req.baseUrl).toStrictEqual('/Customers');
      expect(Object.keys(req.query)).toStrictEqual(['$skip']);
      expect(req.query.$skip).toStrictEqual('5');
    });
  })


  describe('"update" request', function () {
    const data = {givenName: 'dfd'};
    it('Should send "update" request', async () => {
      await client.collection<Customer>('Customers')
          .update(1, data).execute();
      expect(req).toBeDefined();
      expect(req.method).toStrictEqual('PATCH');
      expect(req.baseUrl).toStrictEqual('/Customers@1');
    });

    it('Should return Observable', (done) => {
      client.collection<Customer>('Customers').update(1, data).subscribe({
        next: () => {
          expect(req).toBeDefined();
          expect(req.method).toStrictEqual('PATCH');
          expect(req.baseUrl).toStrictEqual('/Customers@1');
          expect(req.body).toStrictEqual(data);
        },
        complete: done,
        error: done
      });
    });

    it('Should send "update" request with "$include" param', async () => {
      await client.collection('Customers')
          .update(1, data, {include: ['id', 'givenName']}).execute();
      expect(req).toBeDefined();
      expect(req.method).toStrictEqual('PATCH');
      expect(req.baseUrl).toStrictEqual('/Customers@1');
      expect(req.body).toStrictEqual(data);
      expect(Object.keys(req.query)).toStrictEqual(['$include']);
      expect(req.query.$include).toStrictEqual('id,givenName');
    });

    it('Should send "update" request with "$pick" param', async () => {
      await client.collection('Customers')
          .update(1, data, {pick: ['id', 'givenName']}).execute();
      expect(req).toBeDefined();
      expect(req.method).toStrictEqual('PATCH');
      expect(req.baseUrl).toStrictEqual('/Customers@1');
      expect(req.body).toStrictEqual(data);
      expect(Object.keys(req.query)).toStrictEqual(['$pick']);
      expect(req.query.$pick).toStrictEqual('id,givenName');
    });

    it('Should send "update" request with "$omit" param', async () => {
      await client.collection('Customers')
          .update(1, data, {omit: ['id', 'givenName']}).execute();
      expect(req).toBeDefined();
      expect(req.method).toStrictEqual('PATCH');
      expect(req.baseUrl).toStrictEqual('/Customers@1');
      expect(req.body).toStrictEqual(data);
      expect(Object.keys(req.query)).toStrictEqual(['$omit']);
      expect(req.query.$omit).toStrictEqual('id,givenName');
    });

  })


  describe('"updateMany" request', function () {

    const data = {givenName: 'dfd'};

    it('Should send "updateMany" request', async () => {
      await client.collection('Customers')
          .updateMany(data).execute();
      expect(req).toBeDefined();
      expect(req.method).toStrictEqual('PATCH');
      expect(req.baseUrl).toStrictEqual('/Customers');
      expect(req.body).toStrictEqual(data);
    });

    it('Should return Observable', (done) => {
      client.collection<Customer>('Customers').updateMany(data).subscribe({
        next: () => {
          expect(req).toBeDefined();
          expect(req.method).toStrictEqual('PATCH');
          expect(req.baseUrl).toStrictEqual('/Customers');
          expect(req.body).toStrictEqual(data);
        },
        complete: done,
        error: done
      });
    });

    it('Should send "updateMany" request with "$filter" param', async () => {
      await client.collection('Customers')
          .updateMany(data, {filter: 'id=1'}).execute();
      expect(req).toBeDefined();
      expect(req.method).toStrictEqual('PATCH');
      expect(req.baseUrl).toStrictEqual('/Customers');
      expect(req.body).toStrictEqual(data);
      expect(Object.keys(req.query)).toStrictEqual(['$filter']);
      expect(req.query.$filter).toStrictEqual('id=1');
    });
  })

});
