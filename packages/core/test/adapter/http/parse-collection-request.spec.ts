import {
  ApiDocument,
  DocumentFactory,
  HttpRequestMessage,
  HttpRequestMessageHost
} from '@opra/common';
import { OpraHttpAdapter, Request } from '@opra/core';
import { BestCustomerResource } from '../../_support/test-app/resource/best-customer.resource.js';
import { CustomersResource } from '../../_support/test-app/resource/customers.resource.js';

describe('OpraHttpAdapter parse Collection requests', function () {

  class TestHttpAdapter extends OpraHttpAdapter {
    platform = 'test';

    static async create(doc: ApiDocument, options?: OpraHttpAdapter.Options): Promise<TestHttpAdapter> {
      const adapter1 = new TestHttpAdapter(doc);
      await adapter1.init(options);
      return adapter1;
    }

    async parseRequest(incoming: HttpRequestMessage): Promise<Request> {
      return super.parseRequest(incoming);
    }
  }

  let document: ApiDocument;
  let adapter: TestHttpAdapter;

  beforeAll(async () => {
    document = await DocumentFactory.createDocument({
      version: '1.0',
      info: {
        title: 'TestApi',
        version: 'v1',
      },
      resources: [CustomersResource, BestCustomerResource]
    });
    adapter = await TestHttpAdapter.create(document);
  });

  describe('CollectionGetRequest', function () {

    it('Should parse request', async () => {
      const request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'GET',
        url: '/Customers@1?$pick=id&$omit=gender&$include=address',
        headers: {'Accept': 'application/json'}
      }));
      expect(request).toBeDefined();
      const resource = document.getCollection('Customers');
      expect(request.resource).toStrictEqual(resource);
      expect(request.kind).toStrictEqual('CollectionGetRequest');
      expect(request.resourceKind).toStrictEqual('Collection');
      expect(request.operation).toStrictEqual('get');
      expect(request.crud).toStrictEqual('read');
      expect(request.many).toStrictEqual(false);
      expect(request.args.key).toStrictEqual(1);
      expect(request.args.pick).toStrictEqual(['id']);
      expect(request.args.omit).toStrictEqual(['gender']);
      expect(request.args.include).toStrictEqual(['address']);
      expect(() => request.switchToHttp()).not.toThrow();
      expect(request.switchToHttp().headers).toBeDefined();
      expect(request.switchToHttp().headers.accept).toStrictEqual('application/json');
    })

    it('Should normalize element names in "pick" option', async () => {
      let request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'GET',
        url: '/Customers@1?$pick=givenname,GENDER,AdDRess.CIty'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('get');
      expect(request.args.pick).toStrictEqual(['givenName', 'gender', 'address.city']);
      request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'GET',
        url: '/Customers@1?$pick=address,address.city'
      }));
      expect(request.args.pick).toStrictEqual(['address']);
      request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'GET',
        url: '/Customers@1?$pick=address.city,address'
      }));
      expect(request.operation).toStrictEqual('get');
      expect(request.args.pick).toStrictEqual(['address']);
    })

    it('Should normalize element names in "omit" option', async () => {
      let request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'GET',
        url: '/Customers@1?$omit=givenname,GENDER,AdDRess.CIty'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('get');
      expect(request.args.omit).toStrictEqual(['givenName', 'gender', 'address.city']);
      request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'GET',
        url: '/Customers@1?$omit=address,address.city'
      }));
      expect(request.operation).toStrictEqual('get');
      expect(request.args.omit).toStrictEqual(['address']);
      request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'GET',
        url: '/Customers@1?$omit=address.city,address'
      }));
      expect(request.operation).toStrictEqual('get');
      expect(request.args.omit).toStrictEqual(['address']);
    })

    it('Should normalize element names in "include" option', async () => {
      let request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'GET',
        url: '/Customers@1?$include=givenname,GENDER,AdDRess.CIty'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('get');
      expect(request.args.include).toStrictEqual(['givenName', 'gender', 'address.city']);
      request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'GET',
        url: '/Customers@1?$include=address,address.city'
      }));
      expect(request.args.include).toStrictEqual(['address']);
      request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'GET',
        url: '/Customers@1?$include=address.city,address'
      }));
      expect(request.operation).toStrictEqual('get');
      expect(request.args.include).toStrictEqual(['address']);
    })

    it('Should validate if fields in "pick" option are exist', async () => {
      await expect(() => adapter.parseRequest(new HttpRequestMessageHost({
            method: 'GET',
            url: '/Customers@1?$pick=address.x1'
          }))
      ).rejects.toThrow('Unknown element "address.x1"');
    })

    it('Should validate if fields in "omit" option are exist', async () => {
      await expect(() => adapter.parseRequest(new HttpRequestMessageHost({
            method: 'GET',
            url: '/Customers@1?$omit=address.x1'
          }))
      ).rejects.toThrow('Unknown element "address.x1"');
    })

    it('Should validate if fields in "include" option are exist', async () => {
      await expect(() => adapter.parseRequest(new HttpRequestMessageHost({
            method: 'GET',
            url: '/Customers@1?$include=address.x1'
          }))
      ).rejects.toThrow('Unknown element "address.x1"');
    })

    it('Should allow unknown fields in "pick" option if additionalFields set to "true"', async () => {
      const request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'GET',
        url: '/Customers@1?$pick=notes.add1,notes.add2.add3'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('get');
      expect(request.args.pick).toStrictEqual(['notes.add1', 'notes.add2.add3']);
    })

    it('Should allow unknown fields in "omit" option if additionalFields set to "true"', async () => {
      const request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'GET',
        url: '/Customers@1?$omit=notes.add1,notes.add2.add3'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('get');
      expect(request.args.omit).toStrictEqual(['notes.add1', 'notes.add2.add3']);
    })

    it('Should allow unknown fields in "include" option if additionalFields set to "true"', async () => {
      const request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'GET',
        url: '/Customers@1?$include=notes.add1,notes.add2.add3'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('get');
      expect(request.args.include).toStrictEqual(['notes.add1', 'notes.add2.add3']);
    })

  })

  describe('CollectionCreateRequest', function () {

    it('Should parse request', async () => {
      const request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'POST',
        url: '/Customers?$pick=id&$omit=gender&$include=address',
        body: {id: 1},
        headers: {'content-type': 'application/json', 'Accept': 'application/json'}
      }));
      expect(request).toBeDefined();
      const resource = document.getCollection('Customers');
      expect(request.resource).toStrictEqual(resource);
      expect(request.kind).toStrictEqual('CollectionCreateRequest');
      expect(request.resourceKind).toStrictEqual('Collection');
      expect(request.operation).toStrictEqual('create');
      expect(request.crud).toStrictEqual('create');
      expect(request.many).toStrictEqual(false);
      expect(request.args.data).toStrictEqual({id: 1});
      expect(request.args.pick).toStrictEqual(['id']);
      expect(request.args.omit).toStrictEqual(['gender']);
      expect(request.args.include).toStrictEqual(['address']);
      expect(() => request.switchToHttp()).not.toThrow();
      expect(request.switchToHttp().headers).toBeDefined();
      expect(request.switchToHttp().headers.accept).toStrictEqual('application/json');
    })

    it('Should normalize element names in "pick" option', async () => {
      let request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'POST',
        url: '/Customers?$pick=givenname,GENDER,AdDRess.CIty',
        body: {id: 1},
        headers: {'content-type': 'application/json'}
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('create');
      expect(request.args.pick).toStrictEqual(['givenName', 'gender', 'address.city']);
      request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'POST',
        url: '/Customers?$pick=address,address.city',
        body: {id: 1},
        headers: {'content-type': 'application/json'}
      }));
      expect(request.operation).toStrictEqual('create');
      expect(request.args.pick).toStrictEqual(['address']);
      request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'POST',
        url: '/Customers?$pick=address.city,address',
        body: {id: 1},
        headers: {'content-type': 'application/json'}
      }));
      expect(request.operation).toStrictEqual('create');
      expect(request.args.pick).toStrictEqual(['address']);
    })

    it('Should normalize element names in "omit" option', async () => {
      let request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'POST',
        url: '/Customers?$omit=givenname,GENDER,AdDRess.CIty',
        body: {id: 1},
        headers: {'content-type': 'application/json'}
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('create');
      expect(request.args.omit).toStrictEqual(['givenName', 'gender', 'address.city']);
      request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'POST',
        url: '/Customers?$omit=address,address.city',
        body: {id: 1},
        headers: {'content-type': 'application/json'}
      }));
      expect(request.operation).toStrictEqual('create');
      expect(request.args.omit).toStrictEqual(['address']);
      request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'POST',
        url: '/Customers?$omit=address.city,address',
        body: {id: 1},
        headers: {'content-type': 'application/json'}
      }));
      expect(request.operation).toStrictEqual('create');
      expect(request.args.omit).toStrictEqual(['address']);
    })

    it('Should normalize element names in "include" option', async () => {
      let request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'POST',
        url: '/Customers?$include=givenname,GENDER,AdDRess.CIty',
        body: {id: 1},
        headers: {'content-type': 'application/json'}
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('create');
      expect(request.args.include).toStrictEqual(['givenName', 'gender', 'address.city']);
      request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'POST',
        url: '/Customers?$include=address,address.city',
        body: {id: 1},
        headers: {'content-type': 'application/json'}
      }));
      expect(request.args.include).toStrictEqual(['address']);
      expect(request.operation).toStrictEqual('create');
      request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'POST',
        url: '/Customers?$include=address.city,address'
      }));
      expect(request.args.include).toStrictEqual(['address']);
    })

    it('Should validate if fields in "pick" option are exist', async () => {
      await expect(() => adapter.parseRequest(new HttpRequestMessageHost({
            method: 'POST',
            url: '/Customers?$pick=address.x1',
            body: {id: 1},
            headers: {'content-type': 'application/json'}
          }))
      ).rejects.toThrow('Unknown element "address.x1"');
    })

    it('Should validate if fields in "omit" option are exist', async () => {
      await expect(() => adapter.parseRequest(new HttpRequestMessageHost({
            method: 'POST',
            url: '/Customers?$omit=address.x1',
            body: {id: 1},
            headers: {'content-type': 'application/json'}
          }))
      ).rejects.toThrow('Unknown element "address.x1"');
    })

    it('Should validate if fields in "include" option are exist', async () => {
      await expect(() => adapter.parseRequest(new HttpRequestMessageHost({
            method: 'POST',
            url: '/Customers?$include=address.x1',
            body: {id: 1},
            headers: {'content-type': 'application/json'}
          }))
      ).rejects.toThrow('Unknown element "address.x1"');
    })

    it('Should allow unknown fields in "pick" option if additionalFields set to "true"', async () => {
      const request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'POST',
        url: '/Customers?$pick=notes.add1,notes.add2.add3',
        body: {id: 1},
        headers: {'content-type': 'application/json'}
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('create');
      expect(request.args.pick).toStrictEqual(['notes.add1', 'notes.add2.add3']);
    })

    it('Should allow unknown fields in "omit" option if additionalFields set to "true"', async () => {
      const request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'POST',
        url: '/Customers?$omit=notes.add1,notes.add2.add3',
        body: {id: 1},
        headers: {'content-type': 'application/json'}
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('create');
      expect(request.args.omit).toStrictEqual(['notes.add1', 'notes.add2.add3']);
    })

    it('Should allow unknown fields in "include" option if additionalFields set to "true"', async () => {
      const request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'POST',
        url: '/Customers?$include=notes.add1,notes.add2.add3',
        body: {id: 1},
        headers: {'content-type': 'application/json'}
      }));
      expect(request).toBeDefined();
      expect(request.args.include).toStrictEqual(['notes.add1', 'notes.add2.add3']);
    })

  });


  describe('CollectionUpdateRequest', function () {

    it('Should parse request', async () => {
      const request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'PATCH',
        url: '/Customers@1?$pick=id&$omit=gender&$include=address',
        body: {id: 1},
        headers: {'content-type': 'application/json', 'Accept': 'application/json'}
      }));
      expect(request).toBeDefined();
      const resource = document.getCollection('Customers');
      expect(request.resource).toStrictEqual(resource);
      expect(request.kind).toStrictEqual('CollectionUpdateRequest');
      expect(request.resourceKind).toStrictEqual('Collection');
      expect(request.operation).toStrictEqual('update');
      expect(request.crud).toStrictEqual('update');
      expect(request.many).toStrictEqual(false);
      expect(request.args.key).toStrictEqual(1);
      expect(request.args.data).toStrictEqual({id: 1});
      expect(request.args.pick).toStrictEqual(['id']);
      expect(request.args.omit).toStrictEqual(['gender']);
      expect(request.args.include).toStrictEqual(['address']);
      expect(() => request.switchToHttp()).not.toThrow();
      expect(request.switchToHttp().headers).toBeDefined();
      expect(request.switchToHttp().headers.accept).toStrictEqual('application/json');
    })

    it('Should normalize element names in "pick" option', async () => {
      let request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'PATCH',
        url: '/Customers@1?$pick=givenname,GENDER,AdDRess.CIty',
        body: {id: 1},
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('update');
      expect(request.args.pick).toStrictEqual(['givenName', 'gender', 'address.city']);
      request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'PATCH',
        url: '/Customers@1?$pick=address,address.city'
      }));
      expect(request.operation).toStrictEqual('update');
      expect(request.args.pick).toStrictEqual(['address']);
      request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'PATCH',
        url: '/Customers@1?$pick=address.city,address',
        body: {id: 1},
      }));
      expect(request.operation).toStrictEqual('update');
      expect(request.args.pick).toStrictEqual(['address']);
    })

    it('Should normalize element names in "omit" option', async () => {
      let request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'PATCH',
        url: '/Customers@1?$omit=givenname,GENDER,AdDRess.CIty',
        body: {id: 1},
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('update');
      expect(request.args.omit).toStrictEqual(['givenName', 'gender', 'address.city']);
      request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'PATCH',
        url: '/Customers@1?$omit=address,address.city',
        body: {id: 1},
      }));
      expect(request.operation).toStrictEqual('update');
      expect(request.args.omit).toStrictEqual(['address']);
      request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'PATCH',
        url: '/Customers@1?$omit=address.city,address',
        body: {id: 1},
      }));
      expect(request.operation).toStrictEqual('update');
      expect(request.args.omit).toStrictEqual(['address']);
    })

    it('Should normalize element names in "include" option', async () => {
      let request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'PATCH',
        url: '/Customers@1?$include=givenname,GENDER,AdDRess.CIty',
        body: {id: 1},
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('update');
      expect(request.args.include).toStrictEqual(['givenName', 'gender', 'address.city']);
      request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'PATCH',
        url: '/Customers@1?$include=address,address.city',
        body: {id: 1},
      }));
      expect(request.operation).toStrictEqual('update');
      expect(request.args.include).toStrictEqual(['address']);
      request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'PATCH',
        url: '/Customers@1?$include=address.city,address',
        body: {id: 1},
      }));
      expect(request.operation).toStrictEqual('update');
      expect(request.args.include).toStrictEqual(['address']);
    })

    it('Should validate if fields in "pick" option are exist', async () => {
      await expect(() => adapter.parseRequest(new HttpRequestMessageHost({
            method: 'PATCH',
            url: '/Customers@1?$pick=address.x1',
            body: {id: 1},
          }))
      ).rejects.toThrow('Unknown element "address.x1"');
    })

    it('Should validate if fields in "omit" option are exist', async () => {
      await expect(() => adapter.parseRequest(new HttpRequestMessageHost({
            method: 'PATCH',
            url: '/Customers@1?$omit=address.x1',
            body: {id: 1},
          }))
      ).rejects.toThrow('Unknown element "address.x1"');
    })

    it('Should validate if fields in "include" option are exist', async () => {
      await expect(() => adapter.parseRequest(new HttpRequestMessageHost({
            method: 'PATCH',
            url: '/Customers@1?$include=address.x1',
            body: {id: 1},
          }))
      ).rejects.toThrow('Unknown element "address.x1"');
    })

    it('Should allow unknown fields in "pick" option if additionalFields set to "true"', async () => {
      const request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'PATCH',
        url: '/Customers@1?$pick=notes.add1,notes.add2.add3',
        body: {id: 1},
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('update');
      expect(request.args.pick).toStrictEqual(['notes.add1', 'notes.add2.add3']);
    })

    it('Should allow unknown fields in "omit" option if additionalFields set to "true"', async () => {
      const request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'PATCH',
        url: '/Customers@1?$omit=notes.add1,notes.add2.add3',
        body: {id: 1},
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('update');
      expect(request.args.omit).toStrictEqual(['notes.add1', 'notes.add2.add3']);
    })

    it('Should allow unknown fields in "include" option if additionalFields set to "true"', async () => {
      const request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'PATCH',
        url: '/Customers@1?$include=notes.add1,notes.add2.add3',
        body: {id: 1},
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('update');
      expect(request.args.include).toStrictEqual(['notes.add1', 'notes.add2.add3']);
    })

  });

  describe('CollectionUpdateManyRequest', function () {

    it('Should parse request', async () => {
      const request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'PATCH',
        url: '/Customers',
        body: {id: 1},
        headers: {'content-type': 'application/json', 'Accept': 'application/json'}
      }));
      expect(request).toBeDefined();
      const resource = document.getCollection('Customers');
      expect(request.resource).toStrictEqual(resource);
      expect(request.kind).toStrictEqual('CollectionUpdateManyRequest');
      expect(request.resourceKind).toStrictEqual('Collection');
      expect(request.operation).toStrictEqual('updateMany');
      expect(request.crud).toStrictEqual('update');
      expect(request.many).toStrictEqual(true);
      expect(request.args.filter).toBeDefined();
      expect(request.args.data).toStrictEqual({id: 1});
      expect(() => request.switchToHttp()).not.toThrow();
      expect(request.switchToHttp().headers).toBeDefined();
      expect(request.switchToHttp().headers.accept).toStrictEqual('application/json');
    })

    it('Should parse "filter"', async () => {
      const request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'PATCH',
        url: '/Customers?$filter=givenname=John',
        body: {id: 1},
        headers: {'content-type': 'application/json', 'Accept': 'application/json'}
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('updateMany');
      expect(request.args.filter).toBeDefined();
      expect(typeof request.args.filter).toStrictEqual('object');
    })

    it('Should validate if fields in "filter" option are exist', async () => {
      await expect(() => adapter.parseRequest(new HttpRequestMessageHost({
            method: 'PATCH',
            url: '/Customers?$filter=address.x1=1',
            body: {id: 1},
            headers: {'content-type': 'application/json', 'Accept': 'application/json'}
          }))
      ).rejects.toThrow('Unknown element "address.x1"');
    })

  });

  describe('CollectionDeleteRequest', function () {

    it('Should parse request', async () => {
      const request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'DELETE',
        url: '/Customers@1',
        headers: {'Accept': 'application/json'}
      }));
      expect(request).toBeDefined();
      const resource = document.getCollection('Customers');
      expect(request.resource).toStrictEqual(resource);
      expect(request.kind).toStrictEqual('CollectionDeleteRequest');
      expect(request.resourceKind).toStrictEqual('Collection');
      expect(request.operation).toStrictEqual('delete');
      expect(request.crud).toStrictEqual('delete');
      expect(request.many).toStrictEqual(false);
      expect(request.args.key).toStrictEqual(1);
      expect(() => request.switchToHttp()).not.toThrow();
      expect(request.switchToHttp().headers).toBeDefined();
      expect(request.switchToHttp().headers.accept).toStrictEqual('application/json');
    })

  })

  describe('CollectionDeleteManyRequest', function () {

    it('Should parse request', async () => {
      const request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'DELETE',
        url: '/Customers?$filter=id<10',
        headers: {'Accept': 'application/json'}
      }));
      expect(request).toBeDefined();
      const resource = document.getCollection('Customers');
      expect(request.resource).toStrictEqual(resource);
      expect(request.kind).toStrictEqual('CollectionDeleteManyRequest');
      expect(request.resourceKind).toStrictEqual('Collection');
      expect(request.operation).toStrictEqual('deleteMany');
      expect(request.crud).toStrictEqual('delete');
      expect(request.many).toStrictEqual(true);
      expect(request.args.filter).toBeDefined();
      expect(() => request.switchToHttp()).not.toThrow();
      expect(request.switchToHttp().headers).toBeDefined();
      expect(request.switchToHttp().headers.accept).toStrictEqual('application/json');
    })

    it('Should parse "filter"', async () => {
      const request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'DELETE',
        url: '/Customers?$filter=givenname=John'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('deleteMany');
      expect(request.args.filter).toBeDefined();
      expect(typeof request.args.filter).toStrictEqual('object');
    })

    it('Should validate if fields in "filter" option are exist', async () => {
      await expect(() => adapter.parseRequest(new HttpRequestMessageHost({
            method: 'DELETE',
            url: '/Customers?$filter=address.x1=1'
          }))
      ).rejects.toThrow('Unknown element "address.x1"');
    })

  })

  describe('CollectionSearchRequest', function () {

    it('Should parse request', async () => {
      const request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'GET',
        url: '/Customers?$limit=1&$skip=1&$count=n&$distinct=t&$sort=id' +
            '&$pick=id&$omit=gender&$include=address',
        headers: {'Accept': 'application/json'}
      }));
      expect(request).toBeDefined();
      const resource = document.getCollection('Customers');
      expect(request.resource).toStrictEqual(resource);
      expect(request.kind).toStrictEqual('CollectionSearchRequest');
      expect(request.resourceKind).toStrictEqual('Collection');
      expect(request.operation).toStrictEqual('search');
      expect(request.crud).toStrictEqual('read');
      expect(request.many).toStrictEqual(true);
      expect(request.args.sort).toStrictEqual(['id']);
      expect(request.args.pick).toStrictEqual(['id']);
      expect(request.args.omit).toStrictEqual(['gender']);
      expect(request.args.include).toStrictEqual(['address']);
      expect(() => request.switchToHttp()).not.toThrow();
      expect(request.switchToHttp().headers).toBeDefined();
      expect(request.switchToHttp().headers.accept).toStrictEqual('application/json');
    })

    it('Should normalize element names in "pick" option', async () => {
      let request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'GET',
        url: '/Customers?$pick=givenname,GENDER,AdDRess.CIty'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('search');
      expect(request.args.pick).toStrictEqual(['givenName', 'gender', 'address.city']);

      request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'GET',
        url: '/Customers?$pick=address,address.city'
      }));
      expect(request.args.pick).toStrictEqual(['address']);

      request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'GET',
        url: '/Customers?$pick=address.city,address'
      }));
      expect(request.operation).toStrictEqual('search');
      expect(request.args.pick).toStrictEqual(['address']);
    })

    it('Should normalize element names in "omit" option', async () => {
      let request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'GET',
        url: '/Customers?$omit=givenname,GENDER,AdDRess.CIty'
      }));
      expect(request).toBeDefined();
      expect(request.args.omit).toStrictEqual(['givenName', 'gender', 'address.city']);
      request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'GET',
        url: '/Customers?$omit=address,address.city'
      }));
      expect(request.args.omit).toStrictEqual(['address']);
      request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'GET',
        url: '/Customers?$omit=address.city,address'
      }));
      expect(request.args.omit).toStrictEqual(['address']);
    })

    it('Should normalize element names in "include" option', async () => {
      let request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'GET',
        url: '/Customers?$include=givenname,GENDER,AdDRess.CIty'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('search');
      expect(request.args.include).toStrictEqual(['givenName', 'gender', 'address.city']);

      request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'GET',
        url: '/Customers?$include=address,address.city'
      }));
      expect(request.operation).toStrictEqual('search');
      expect(request.args.include).toStrictEqual(['address']);

      request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'GET',
        url: '/Customers?$include=address.city,address'
      }));
      expect(request.operation).toStrictEqual('search');
      expect(request.args.include).toStrictEqual(['address']);
    })

    it('Should normalize element names in "sort" option', async () => {
      const request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'GET',
        url: '/Customers?$sort=givenname,GENDER,AdDRess.CIty'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('search');
      expect(request.args.sort).toStrictEqual(['givenName', 'gender', 'address.city']);
    })

    it('Should validate if fields in "pick" option are exist', async () => {
      await expect(() => adapter.parseRequest(new HttpRequestMessageHost({
            method: 'GET',
            url: '/Customers?$pick=address.x1'
          }))
      ).rejects.toThrow('Unknown element "address.x1"');
    })

    it('Should validate if fields in "omit" option are exist', async () => {
      await expect(() => adapter.parseRequest(new HttpRequestMessageHost({
            method: 'GET',
            url: '/Customers?$omit=address.x1'
          }))
      ).rejects.toThrow('Unknown element "address.x1"');
    })

    it('Should validate if fields in "include" option are exist', async () => {
      await expect(() => adapter.parseRequest(new HttpRequestMessageHost({
            method: 'GET',
            url: '/Customers?$include=address.x1'
          }))
      ).rejects.toThrow('Unknown element "address.x1"');
    })

    it('Should validate if fields in "sort" option are exist', async () => {
      await expect(() => adapter.parseRequest(new HttpRequestMessageHost({
            method: 'GET',
            url: '/Customers?$sort=address.x1'
          }))
      ).rejects.toThrow('Unknown element "address.x1"');
    })

    it('Should validate if field is available for sorting', async () => {
      await expect(() => adapter.parseRequest(new HttpRequestMessageHost({
            method: 'GET',
            url: '/Customers?$sort=cid'
          }))
      ).rejects.toThrow('is not available for sort operation');
    })

    it('Should allow unknown fields in "pick" option if additionalFields set to "true"', async () => {
      const request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'GET',
        url: '/Customers?$pick=notes.add1,notes.add2.add3'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('search');
      expect(request.args.pick).toStrictEqual(['notes.add1', 'notes.add2.add3']);
    })

    it('Should allow unknown fields in "omit" option if additionalFields set to "true"', async () => {
      const request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'GET',
        url: '/Customers?$omit=notes.add1,notes.add2.add3'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('search');
      expect(request.args.omit).toStrictEqual(['notes.add1', 'notes.add2.add3']);
    })

    it('Should allow unknown fields in "include" option if additionalFields set to "true"', async () => {
      const request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'GET',
        url: '/Customers?$include=notes.add1,notes.add2.add3'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('search');
      expect(request.args.include).toStrictEqual(['notes.add1', 'notes.add2.add3']);
    })

    it('Should parse "limit" option', async () => {
      const request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'GET',
        url: '/Customers?$limit=5'
      }));
      expect(request).toBeDefined();
      expect(request.args.limit).toStrictEqual(5);
    })

    it('Should validate "limit" option', async () => {
      await expect(() => adapter.parseRequest(new HttpRequestMessageHost({
        method: 'GET',
        url: '/Customers?$limit=x5'
      }))).rejects.toThrow('not a valid number');
    })

    it('Should parse "skip" option', async () => {
      const request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'GET',
        url: '/Customers?$skip=5'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('search');
      expect(request.args.skip).toStrictEqual(5);
    })

    it('Should validate "skip" option', async () => {
      await expect(() => adapter.parseRequest(new HttpRequestMessageHost({
        method: 'GET',
        url: '/Customers?$skip=x5'
      }))).rejects.toThrow('not a valid number');
    })

    it('Should parse "count" option', async () => {
      let request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'GET',
        url: '/Customers?$count=true'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('search');
      expect(request.args.count).toStrictEqual(true);
      request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'GET',
        url: '/Customers?$count=1'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('search');
      expect(request.args.count).toStrictEqual(true);
      request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'GET',
        url: '/Customers?$count=t'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('search');
      expect(request.args.count).toStrictEqual(true);
      request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'GET',
        url: '/Customers?$count=false'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('search');
      expect(request.args.count).toStrictEqual(false);
      request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'GET',
        url: '/Customers?$count=0'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('search');
      expect(request.args.count).toStrictEqual(false);
      request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'GET',
        url: '/Customers?$count=f'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('search');
      expect(request.args.count).toStrictEqual(false);
    })

    it('Should validate "count" option', async () => {
      await expect(() => adapter.parseRequest(new HttpRequestMessageHost({
        method: 'GET',
        url: '/Customers?$count=x5'
      }))).rejects.toThrow('not a valid boolean');
    })

    it('Should parse "distinct" option', async () => {
      let request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'GET',
        url: '/Customers?$distinct=true'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('search');
      expect(request.args.distinct).toStrictEqual(true);
      request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'GET',
        url: '/Customers?$distinct=1'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('search');
      expect(request.args.distinct).toStrictEqual(true);
      request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'GET',
        url: '/Customers?$distinct=t'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('search');
      expect(request.args.distinct).toStrictEqual(true);
      request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'GET',
        url: '/Customers?$distinct=false'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('search');
      expect(request.args.distinct).toStrictEqual(false);
      request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'GET',
        url: '/Customers?$distinct=0'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('search');
      expect(request.args.distinct).toStrictEqual(false);
      request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'GET',
        url: '/Customers?$distinct=f'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('search');
      expect(request.args.distinct).toStrictEqual(false);
    })

    it('Should validate "distinct" option', async () => {
      await expect(() => adapter.parseRequest(new HttpRequestMessageHost({
        method: 'GET',
        url: '/Customers?$distinct=x5'
      }))).rejects.toThrow('not a valid boolean');
    })

    it('Should parse "filter"', async () => {
      const request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'GET',
        url: '/Customers?$filter=givenname=John'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('search');
      expect(request.args.filter).toBeDefined();
      expect(typeof request.args.filter).toStrictEqual('object');
    })

    it('Should validate if fields in "filter" option are exist', async () => {
      await expect(() => adapter.parseRequest(new HttpRequestMessageHost({
            method: 'GET',
            url: '/Customers?$filter=address.x1=1'
          }))
      ).rejects.toThrow('Unknown element "address.x1"');
    })

  })

});

