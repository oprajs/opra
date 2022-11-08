import { AxiosRequestConfig } from 'axios';
import type { Customer } from '@opra/core/test/_support/test-app/entities/customer.entity';
import { OpraDocument } from '@opra/schema';
import { OpraURLSearchParams } from '@opra/url';
import { createTestDocument } from '../../core/test/_support/test-app/create-service.js';
import { OpraClient } from '../src/client.js';

describe('OpraClient:CollectionService', function () {

  let document: OpraDocument;
  const serviceUrl = 'http://localhost';

  class MockClient extends OpraClient {
    protected async _fetchMetadata(): Promise<void> {
      this._metadata = document;
    }
  }

  let req!: AxiosRequestConfig;
  jest.spyOn<MockClient, any>(MockClient.prototype, '_send')
      .mockImplementation(async (r: any) => {
        req = r;
      });

  beforeAll(async () => {
    document = await createTestDocument();
  });

  describe('"create" request', function () {
    const data = {id: 1, givenName: 'dfd'};
    it('Should send "create" request', async () => {
      const client = await MockClient.create(serviceUrl);
      await client.collection<Customer>('Customers').create(data);
      expect(req).toBeDefined();
      expect(req.method).toStrictEqual('POST');
      expect(req.url).toStrictEqual(client.serviceUrl + '/Customers');
      expect(req.data).toBe(data);
    });

    it('Should send "create" request with "$include" param', async () => {
      const client = await MockClient.create(serviceUrl);
      await client.collection('Customers').create(data).include('id', 'givenName');
      expect(req).toBeDefined();
      expect(req.method).toStrictEqual('POST');
      expect(req.url).toStrictEqual(client.serviceUrl + '/Customers');
      expect(req.data).toBe(data);
      expect(req.params).toBeInstanceOf(OpraURLSearchParams);
      expect(Array.from(req.params.keys())).toStrictEqual(['$include']);
      expect(req.params.get('$include')).toStrictEqual(['id', 'givenName']);
    });

    it('Should send "create" request with "$pick" param', async () => {
      const client = await MockClient.create(serviceUrl);
      await client.collection('Customers').create(data).pick('id', 'givenName');
      expect(req).toBeDefined();
      expect(req.method).toStrictEqual('POST');
      expect(req.url).toStrictEqual(client.serviceUrl + '/Customers');
      expect(req.data).toBe(data);
      expect(req.params).toBeInstanceOf(OpraURLSearchParams);
      expect(Array.from(req.params.keys())).toStrictEqual(['$pick']);
      expect(req.params.get('$pick')).toStrictEqual(['id', 'givenName']);
    });

    it('Should send "create" request with "$omit" param', async () => {
      const client = await MockClient.create(serviceUrl);
      await client.collection('Customers').create(data).omit('id', 'givenName');
      expect(req).toBeDefined();
      expect(req.method).toStrictEqual('POST');
      expect(req.url).toStrictEqual(client.serviceUrl + '/Customers');
      expect(req.data).toBe(data);
      expect(req.params).toBeInstanceOf(OpraURLSearchParams);
      expect(Array.from(req.params.keys())).toStrictEqual(['$omit']);
      expect(req.params.get('$omit')).toStrictEqual(['id', 'givenName']);
    });

    it('Should send "create" request with "$limit" param', async () => {
      const client = await MockClient.create(serviceUrl);
      await client.collection('Customers').create(data).omit('id', 'givenName');
      expect(req).toBeDefined();
      expect(req.method).toStrictEqual('POST');
      expect(req.url).toStrictEqual(client.serviceUrl + '/Customers');
      expect(req.data).toBe(data);
      expect(req.params).toBeInstanceOf(OpraURLSearchParams);
      expect(Array.from(req.params.keys())).toStrictEqual(['$omit']);
      expect(req.params.get('$omit')).toStrictEqual(['id', 'givenName']);
    });
  })

  describe('"delete" request', function () {
    it('Should send "get" request', async () => {
      const client = await MockClient.create(serviceUrl);
      await client.collection('Customers').delete(1);
      expect(req).toBeDefined();
      expect(req.method).toStrictEqual('DELETE');
      expect(req.url).toStrictEqual(client.serviceUrl + '/Customers@1');
    });
  })

  describe('"deleteMany" request', function () {
    it('Should send "deleteMany" request', async () => {
      const client = await MockClient.create(serviceUrl);
      await client.collection('Customers').deleteMany();
      expect(req).toBeDefined();
      expect(req.method).toStrictEqual('DELETE');
      expect(req.url).toStrictEqual(client.serviceUrl + '/Customers');
    });

    it('Should send "deleteMany" request with "$filter" param', async () => {
      const client = await MockClient.create(serviceUrl);
      await client.collection('Customers').deleteMany().filter('id=1');
      expect(req).toBeDefined();
      expect(req.method).toStrictEqual('DELETE');
      expect(req.url).toStrictEqual(client.serviceUrl + '/Customers');
      expect(req.params).toBeInstanceOf(OpraURLSearchParams);
      expect(Array.from(req.params.keys())).toStrictEqual(['$filter']);
      expect('' + req.params.get('$filter')).toStrictEqual('id=1');
    });
  })

  describe('"update" request', function () {
    const data = {givenName: 'dfd'};
    it('Should send "update" request', async () => {
      const client = await MockClient.create(serviceUrl);
      await client.collection<Customer>('Customers').update(1, data);
      expect(req).toBeDefined();
      expect(req.method).toStrictEqual('PATCH');
      expect(req.url).toStrictEqual(client.serviceUrl + '/Customers@1');
    });

    it('Should send "update" request with "$include" param', async () => {
      const client = await MockClient.create(serviceUrl);
      await client.collection('Customers').update(1, data).include('id', 'givenName');
      expect(req).toBeDefined();
      expect(req.method).toStrictEqual('PATCH');
      expect(req.url).toStrictEqual(client.serviceUrl + '/Customers@1');
      expect(req.data).toBe(data);
      expect(req.params).toBeInstanceOf(OpraURLSearchParams);
      expect(Array.from(req.params.keys())).toStrictEqual(['$include']);
      expect(req.params.get('$include')).toStrictEqual(['id', 'givenName']);
    });

    it('Should send "update" request with "$pick" param', async () => {
      const client = await MockClient.create(serviceUrl);
      await client.collection('Customers').update(1, data).pick('id', 'givenName');
      expect(req).toBeDefined();
      expect(req.method).toStrictEqual('PATCH');
      expect(req.url).toStrictEqual(client.serviceUrl + '/Customers@1');
      expect(req.data).toBe(data);
      expect(req.params).toBeInstanceOf(OpraURLSearchParams);
      expect(Array.from(req.params.keys())).toStrictEqual(['$pick']);
      expect(req.params.get('$pick')).toStrictEqual(['id', 'givenName']);
    });

    it('Should send "update" request with "$omit" param', async () => {
      const client = await MockClient.create(serviceUrl);
      await client.collection('Customers').update(1, data).omit('id', 'givenName');
      expect(req).toBeDefined();
      expect(req.method).toStrictEqual('PATCH');
      expect(req.url).toStrictEqual(client.serviceUrl + '/Customers@1');
      expect(req.data).toBe(data);
      expect(req.params).toBeInstanceOf(OpraURLSearchParams);
      expect(Array.from(req.params.keys())).toStrictEqual(['$omit']);
      expect(req.params.get('$omit')).toStrictEqual(['id', 'givenName']);
    });

    it('Should send "update" request with "$limit" param', async () => {
      const client = await MockClient.create(serviceUrl);
      await client.collection('Customers').update(1, data).omit('id', 'givenName');
      expect(req).toBeDefined();
      expect(req.method).toStrictEqual('PATCH');
      expect(req.url).toStrictEqual(client.serviceUrl + '/Customers@1');
      expect(req.data).toBe(data);
      expect(req.params).toBeInstanceOf(OpraURLSearchParams);
      expect(Array.from(req.params.keys())).toStrictEqual(['$omit']);
      expect(req.params.get('$omit')).toStrictEqual(['id', 'givenName']);
    });
  })

  describe('"updateMany" request', function () {
    const data = {givenName: 'dfd'};
    it('Should send "updateMany" request', async () => {
      const client = await MockClient.create(serviceUrl);
      await client.collection('Customers').updateMany(data);
      expect(req).toBeDefined();
      expect(req.method).toStrictEqual('PATCH');
      expect(req.url).toStrictEqual(client.serviceUrl + '/Customers');
      expect(req.data).toBe(data);
    });

    it('Should send "updateMany" request with "$filter" param', async () => {
      const client = await MockClient.create(serviceUrl);
      await client.collection('Customers').updateMany(data).filter('id=1');
      expect(req).toBeDefined();
      expect(req.method).toStrictEqual('PATCH');
      expect(req.url).toStrictEqual(client.serviceUrl + '/Customers');
      expect(req.data).toBe(data);
      expect(req.params).toBeInstanceOf(OpraURLSearchParams);
      expect(Array.from(req.params.keys())).toStrictEqual(['$filter']);
      expect('' + req.params.get('$filter')).toStrictEqual('id=1');
    });
  })

});
