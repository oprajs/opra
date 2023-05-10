import {
  ApiDocument,
  DocumentFactory,
  HttpRequestMessage,
} from '@opra/common';
import { OpraHttpAdapter, Request } from '@opra/core';
import { CustomersResource, MyProfileResource } from '../../_support/test-app/index.js';

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
      resources: [CustomersResource, MyProfileResource]
    });
    adapter = await TestHttpAdapter.create(document);
  });

  describe('CollectionGetRequest', function () {

    it('Should parse request', async () => {
      const request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'GET',
        url: '/Customers@1?$pick=_id&$omit=gender&$include=address',
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
      expect(request.args.pick).toStrictEqual(['_id']);
      expect(request.args.omit).toStrictEqual(['gender']);
      expect(request.args.include).toStrictEqual(['address']);
      expect(() => request.switchToHttp()).not.toThrow();
      expect(request.switchToHttp().headers).toBeDefined();
      expect(request.switchToHttp().headers.accept).toStrictEqual('application/json');
    })

    it('Should normalize field names in "pick" option', async () => {
      const request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'GET',
        url: '/Customers@1?$pick=givenname,GENDER,Address,address.countryCode'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('get');
      expect(request.args.pick).toStrictEqual(['givenName', 'gender', 'address', 'address.countryCode']);
    })

    it('Should normalize field names in "omit" option', async () => {
      let request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'GET',
        url: '/Customers@1?$omit=givenname,GENDER,address.countryCode'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('get');
      expect(request.args.omit).toStrictEqual(['givenName', 'gender', 'address.countryCode']);
      request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'GET',
        url: '/Customers@1?$omit=address,address.countryCode'
      }));
      expect(request.operation).toStrictEqual('get');
      expect(request.args.omit).toStrictEqual(['address', 'address.countryCode']);
    })

    it('Should normalize field names in "include" option', async () => {
      let request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'GET',
        url: '/Customers@1?$include=givenname,GENDER,address.countryCode'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('get');
      expect(request.args.include).toStrictEqual(['givenName', 'gender', 'address.countryCode']);
      request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'GET',
        url: '/Customers@1?$include=address,address.countryCode'
      }));
      expect(request.args.include).toStrictEqual(['address', 'address.countryCode']);
    })

    it('Should validate if fields in "pick" option are exist', async () => {
      await expect(() => adapter.parseRequest(HttpRequestMessage.create({
            method: 'GET',
            url: '/Customers@1?$pick=address.x1'
          }))
      ).rejects.toThrow('Invalid');
    })

    it('Should validate if fields in "omit" option are exist', async () => {
      await expect(() => adapter.parseRequest(HttpRequestMessage.create({
            method: 'GET',
            url: '/Customers@1?$omit=address.x1'
          }))
      ).rejects.toThrow('Invalid');
    })

    it('Should validate if fields in "include" option are exist', async () => {
      await expect(() => adapter.parseRequest(HttpRequestMessage.create({
            method: 'GET',
            url: '/Customers@1?$include=address.x1'
          }))
      ).rejects.toThrow('Invalid');
    })

    it('Should allow unknown fields in "pick" option if additionalFields set to "true"', async () => {
      const request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'GET',
        url: '/Customers@1?$pick=notes.add1,notes.add2.add3'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('get');
      expect(request.args.pick).toStrictEqual(['notes.add1', 'notes.add2.add3']);
    })

    it('Should allow unknown fields in "omit" option if additionalFields set to "true"', async () => {
      const request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'GET',
        url: '/Customers@1?$omit=notes.add1,notes.add2.add3'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('get');
      expect(request.args.omit).toStrictEqual(['notes.add1', 'notes.add2.add3']);
    })

    it('Should allow unknown fields in "include" option if additionalFields set to "true"', async () => {
      const request = await adapter.parseRequest(HttpRequestMessage.create({
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
      const request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'POST',
        url: '/Customers?$pick=_id&$omit=gender&$include=address',
        body: {_id: 1},
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
      expect(request.args.data).toStrictEqual({_id: 1});
      expect(request.args.pick).toStrictEqual(['_id']);
      expect(request.args.omit).toStrictEqual(['gender']);
      expect(request.args.include).toStrictEqual(['address']);
      expect(() => request.switchToHttp()).not.toThrow();
      expect(request.switchToHttp().headers).toBeDefined();
      expect(request.switchToHttp().headers.accept).toStrictEqual('application/json');
    })

    it('Should normalize field names in "pick" option', async () => {
      const request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'POST',
        url: '/Customers?$pick=givenname,GENDER,address,address.countryCode',
        body: {_id: 1},
        headers: {'content-type': 'application/json'}
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('create');
      expect(request.args.pick).toStrictEqual(['givenName', 'gender', 'address', 'address.countryCode']);
    })

    it('Should normalize field names in "omit" option', async () => {
      const request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'POST',
        url: '/Customers?$omit=givenname,GENDER,address,address.countryCode',
        body: {_id: 1},
        headers: {'content-type': 'application/json'}
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('create');
      expect(request.args.omit).toStrictEqual(['givenName', 'gender', 'address', 'address.countryCode']);
    })

    it('Should normalize field names in "include" option', async () => {
      const request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'POST',
        url: '/Customers?$include=givenname,GENDER,address,address.countryCode',
        body: {_id: 1},
        headers: {'content-type': 'application/json'}
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('create');
      expect(request.args.include).toStrictEqual(['givenName', 'gender', 'address', 'address.countryCode']);
    })

    it('Should validate if fields in "pick" option are exist', async () => {
      await expect(() => adapter.parseRequest(HttpRequestMessage.create({
            method: 'POST',
            url: '/Customers?$pick=address.x1',
            body: {_id: 1},
            headers: {'content-type': 'application/json'}
          }))
      ).rejects.toThrow('Invalid field');
    })

    it('Should validate if fields in "omit" option are exist', async () => {
      await expect(() => adapter.parseRequest(HttpRequestMessage.create({
            method: 'POST',
            url: '/Customers?$omit=address.x1',
            body: {_id: 1},
            headers: {'content-type': 'application/json'}
          }))
      ).rejects.toThrow('Invalid field');
    })

    it('Should validate if fields in "include" option are exist', async () => {
      await expect(() => adapter.parseRequest(HttpRequestMessage.create({
            method: 'POST',
            url: '/Customers?$include=address.x1',
            body: {_id: 1},
            headers: {'content-type': 'application/json'}
          }))
      ).rejects.toThrow('Invalid field');
    })

    it('Should allow unknown fields in "pick" option if additionalFields set to "true"', async () => {
      const request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'POST',
        url: '/Customers?$pick=notes.add1,notes.add2.add3',
        body: {_id: 1},
        headers: {'content-type': 'application/json'}
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('create');
      expect(request.args.pick).toStrictEqual(['notes.add1', 'notes.add2.add3']);
    })

    it('Should allow unknown fields in "omit" option if additionalFields set to "true"', async () => {
      const request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'POST',
        url: '/Customers?$omit=notes.add1,notes.add2.add3',
        body: {_id: 1},
        headers: {'content-type': 'application/json'}
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('create');
      expect(request.args.omit).toStrictEqual(['notes.add1', 'notes.add2.add3']);
    })

    it('Should allow unknown fields in "include" option if additionalFields set to "true"', async () => {
      const request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'POST',
        url: '/Customers?$include=notes.add1,notes.add2.add3',
        body: {_id: 1},
        headers: {'content-type': 'application/json'}
      }));
      expect(request).toBeDefined();
      expect(request.args.include).toStrictEqual(['notes.add1', 'notes.add2.add3']);
    })

  });


  describe('CollectionUpdateRequest', function () {

    it('Should parse request', async () => {
      const request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'PATCH',
        url: '/Customers@1?$pick=_id&$omit=gender&$include=address',
        body: {_id: 1},
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
      expect(request.args.data).toStrictEqual({_id: 1});
      expect(request.args.pick).toStrictEqual(['_id']);
      expect(request.args.omit).toStrictEqual(['gender']);
      expect(request.args.include).toStrictEqual(['address']);
      expect(() => request.switchToHttp()).not.toThrow();
      expect(request.switchToHttp().headers).toBeDefined();
      expect(request.switchToHttp().headers.accept).toStrictEqual('application/json');
    })

    it('Should normalize field names in "pick" option', async () => {
      const request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'PATCH',
        url: '/Customers@1?$pick=givenname,GENDER,Address,address.countryCode',
        body: {_id: 1},
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('update');
      expect(request.args.pick).toStrictEqual(['givenName', 'gender', 'address', 'address.countryCode']);
    })

    it('Should normalize field names in "omit" option', async () => {
      const request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'PATCH',
        url: '/Customers@1?$omit=givenname,GENDER,Address,address.countryCode',
        body: {_id: 1},
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('update');
      expect(request.args.omit).toStrictEqual(['givenName', 'gender', 'address', 'address.countryCode']);
    })

    it('Should normalize field names in "include" option', async () => {
      const request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'PATCH',
        url: '/Customers@1?$include=givenname,GENDER,Address,address.countryCode',
        body: {_id: 1},
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('update');
      expect(request.args.include).toStrictEqual(['givenName', 'gender', 'address', 'address.countryCode']);
    })

    it('Should validate if fields in "pick" option are exist', async () => {
      await expect(() => adapter.parseRequest(HttpRequestMessage.create({
            method: 'PATCH',
            url: '/Customers@1?$pick=address.x1',
            body: {_id: 1},
          }))
      ).rejects.toThrow('Invalid field');
    })

    it('Should validate if fields in "omit" option are exist', async () => {
      await expect(() => adapter.parseRequest(HttpRequestMessage.create({
            method: 'PATCH',
            url: '/Customers@1?$omit=address.x1',
            body: {_id: 1},
          }))
      ).rejects.toThrow('Invalid field');
    })

    it('Should validate if fields in "include" option are exist', async () => {
      await expect(() => adapter.parseRequest(HttpRequestMessage.create({
            method: 'PATCH',
            url: '/Customers@1?$include=address.x1',
            body: {_id: 1},
          }))
      ).rejects.toThrow('Invalid field');
    })

    it('Should allow unknown fields in "pick" option if additionalFields set to "true"', async () => {
      const request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'PATCH',
        url: '/Customers@1?$pick=notes.add1,notes.add2.add3',
        body: {_id: 1},
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('update');
      expect(request.args.pick).toStrictEqual(['notes.add1', 'notes.add2.add3']);
    })

    it('Should allow unknown fields in "omit" option if additionalFields set to "true"', async () => {
      const request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'PATCH',
        url: '/Customers@1?$omit=notes.add1,notes.add2.add3',
        body: {_id: 1},
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('update');
      expect(request.args.omit).toStrictEqual(['notes.add1', 'notes.add2.add3']);
    })

    it('Should allow unknown fields in "include" option if additionalFields set to "true"', async () => {
      const request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'PATCH',
        url: '/Customers@1?$include=notes.add1,notes.add2.add3',
        body: {_id: 1},
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('update');
      expect(request.args.include).toStrictEqual(['notes.add1', 'notes.add2.add3']);
    })

  });

  describe('CollectionUpdateManyRequest', function () {

    it('Should parse request', async () => {
      const request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'PATCH',
        url: '/Customers',
        body: {_id: 1},
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
      expect(request.args.data).toStrictEqual({_id: 1});
      expect(() => request.switchToHttp()).not.toThrow();
      expect(request.switchToHttp().headers).toBeDefined();
      expect(request.switchToHttp().headers.accept).toStrictEqual('application/json');
    })

    it('Should parse "filter"', async () => {
      const request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'PATCH',
        url: '/Customers?$filter=givenname="John"',
        body: {_id: 1},
        headers: {'content-type': 'application/json', 'Accept': 'application/json'}
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('updateMany');
      expect(request.args.filter).toBeDefined();
      expect(typeof request.args.filter).toStrictEqual('object');
    })

    it('Should validate if fields in "filter" option are exist', async () => {
      await expect(() => adapter.parseRequest(HttpRequestMessage.create({
            method: 'PATCH',
            url: '/Customers?$filter=address.x1=1',
            body: {_id: 1},
            headers: {'content-type': 'application/json', 'Accept': 'application/json'}
          }))
      ).rejects.toThrow('Invalid field');
    })

  });

  describe('CollectionDeleteRequest', function () {

    it('Should parse request', async () => {
      const request = await adapter.parseRequest(HttpRequestMessage.create({
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
      const request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'DELETE',
        url: '/Customers?$filter=_id<10',
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
      const request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'DELETE',
        url: '/Customers?$filter=givenname="John"'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('deleteMany');
      expect(request.args.filter).toBeDefined();
      expect(typeof request.args.filter).toStrictEqual('object');
    })

    it('Should validate if fields in "filter" option are exist', async () => {
      await expect(() => adapter.parseRequest(HttpRequestMessage.create({
            method: 'DELETE',
            url: '/Customers?$filter=address.x1=1'
          }))
      ).rejects.toThrow('Invalid field');
    })

  })

  describe('CollectionFindManyRequest', function () {

    it('Should parse request', async () => {
      const request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'GET',
        url: '/Customers?$limit=1&$skip=1&$count=n&$distinct=t&$sort=_id' +
            '&$pick=_id&$omit=gender&$include=address',
        headers: {'Accept': 'application/json'}
      }));
      expect(request).toBeDefined();
      const resource = document.getCollection('Customers');
      expect(request.resource).toStrictEqual(resource);
      expect(request.kind).toStrictEqual('CollectionFindManyRequest');
      expect(request.resourceKind).toStrictEqual('Collection');
      expect(request.operation).toStrictEqual('findMany');
      expect(request.crud).toStrictEqual('read');
      expect(request.many).toStrictEqual(true);
      expect(request.args.sort).toStrictEqual(['_id']);
      expect(request.args.pick).toStrictEqual(['_id']);
      expect(request.args.omit).toStrictEqual(['gender']);
      expect(request.args.include).toStrictEqual(['address']);
      expect(() => request.switchToHttp()).not.toThrow();
      expect(request.switchToHttp().headers).toBeDefined();
      expect(request.switchToHttp().headers.accept).toStrictEqual('application/json');
    })

    it('Should normalize field names in "pick" option', async () => {
      const request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'GET',
        url: '/Customers@1?$pick=givenname,GENDER,Address,address.countryCode'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('get');
      expect(request.args.pick).toStrictEqual(['givenName', 'gender', 'address', 'address.countryCode']);
    })

    it('Should normalize field names in "omit" option', async () => {
      const request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'GET',
        url: '/Customers@1?$omit=givenname,GENDER,Address,address.countryCode'
      }));
      expect(request).toBeDefined();
      expect(request.args.omit).toStrictEqual(['givenName', 'gender', 'address', 'address.countryCode']);
    })

    it('Should normalize field names in "include" option', async () => {
      const request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'GET',
        url: '/Customers@1?$include=givenname,GENDER,Address,address.countryCode'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('get');
      expect(request.args.include).toStrictEqual(['givenName', 'gender', 'address', 'address.countryCode']);
    })

    it('Should normalize field names in "sort" option', async () => {
      const request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'GET',
        url: '/Customers?$sort=givenname,GENDER,address.countryCode'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('findMany');
      expect(request.args.sort).toStrictEqual(['givenName', 'gender', 'address.countryCode']);
    })

    it('Should validate if fields in "pick" option are exist', async () => {
      await expect(() => adapter.parseRequest(HttpRequestMessage.create({
            method: 'GET',
            url: '/Customers?$pick=address.x1'
          }))
      ).rejects.toThrow('Invalid field');
    })

    it('Should validate if fields in "omit" option are exist', async () => {
      await expect(() => adapter.parseRequest(HttpRequestMessage.create({
            method: 'GET',
            url: '/Customers?$omit=address.x1'
          }))
      ).rejects.toThrow('Invalid field');
    })

    it('Should validate if fields in "include" option are exist', async () => {
      await expect(() => adapter.parseRequest(HttpRequestMessage.create({
            method: 'GET',
            url: '/Customers?$include=address.x1'
          }))
      ).rejects.toThrow('Invalid field');
    })

    it('Should validate if fields in "sort" option are exist', async () => {
      await expect(() => adapter.parseRequest(HttpRequestMessage.create({
            method: 'GET',
            url: '/Customers?$sort=address.x1'
          }))
      ).rejects.toThrow('Invalid field');
    })

    it('Should validate if field is available for sorting', async () => {
      await expect(() => adapter.parseRequest(HttpRequestMessage.create({
            method: 'GET',
            url: '/Customers?$sort=uid'
          }))
      ).rejects.toThrow('is not available for sort operation');
    })

    it('Should allow unknown fields in "pick" option if additionalFields set to "true"', async () => {
      const request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'GET',
        url: '/Customers?$pick=notes.add1,notes.add2.add3'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('findMany');
      expect(request.args.pick).toStrictEqual(['notes.add1', 'notes.add2.add3']);
    })

    it('Should allow unknown fields in "omit" option if additionalFields set to "true"', async () => {
      const request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'GET',
        url: '/Customers?$omit=notes.add1,notes.add2.add3'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('findMany');
      expect(request.args.omit).toStrictEqual(['notes.add1', 'notes.add2.add3']);
    })

    it('Should allow unknown fields in "include" option if additionalFields set to "true"', async () => {
      const request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'GET',
        url: '/Customers?$include=notes.add1,notes.add2.add3'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('findMany');
      expect(request.args.include).toStrictEqual(['notes.add1', 'notes.add2.add3']);
    })

    it('Should parse "limit" option', async () => {
      const request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'GET',
        url: '/Customers?$limit=5'
      }));
      expect(request).toBeDefined();
      expect(request.args.limit).toStrictEqual(5);
    })

    it('Should validate "limit" option', async () => {
      await expect(() => adapter.parseRequest(HttpRequestMessage.create({
        method: 'GET',
        url: '/Customers?$limit=x5'
      }))).rejects.toThrow('not a valid number');
    })

    it('Should parse "skip" option', async () => {
      const request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'GET',
        url: '/Customers?$skip=5'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('findMany');
      expect(request.args.skip).toStrictEqual(5);
    })

    it('Should validate "skip" option', async () => {
      await expect(() => adapter.parseRequest(HttpRequestMessage.create({
        method: 'GET',
        url: '/Customers?$skip=x5'
      }))).rejects.toThrow('not a valid number');
    })

    it('Should parse "count" option', async () => {
      let request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'GET',
        url: '/Customers?$count=true'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('findMany');
      expect(request.args.count).toStrictEqual(true);
      request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'GET',
        url: '/Customers?$count=1'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('findMany');
      expect(request.args.count).toStrictEqual(true);
      request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'GET',
        url: '/Customers?$count=t'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('findMany');
      expect(request.args.count).toStrictEqual(true);
      request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'GET',
        url: '/Customers?$count=false'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('findMany');
      expect(request.args.count).toStrictEqual(false);
      request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'GET',
        url: '/Customers?$count=0'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('findMany');
      expect(request.args.count).toStrictEqual(false);
      request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'GET',
        url: '/Customers?$count=f'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('findMany');
      expect(request.args.count).toStrictEqual(false);
    })

    it('Should validate "count" option', async () => {
      await expect(() => adapter.parseRequest(HttpRequestMessage.create({
        method: 'GET',
        url: '/Customers?$count=x5'
      }))).rejects.toThrow('not a valid boolean');
    })

    it('Should parse "distinct" option', async () => {
      let request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'GET',
        url: '/Customers?$distinct=true'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('findMany');
      expect(request.args.distinct).toStrictEqual(true);
      request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'GET',
        url: '/Customers?$distinct=1'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('findMany');
      expect(request.args.distinct).toStrictEqual(true);
      request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'GET',
        url: '/Customers?$distinct=t'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('findMany');
      expect(request.args.distinct).toStrictEqual(true);
      request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'GET',
        url: '/Customers?$distinct=false'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('findMany');
      expect(request.args.distinct).toStrictEqual(false);
      request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'GET',
        url: '/Customers?$distinct=0'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('findMany');
      expect(request.args.distinct).toStrictEqual(false);
      request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'GET',
        url: '/Customers?$distinct=f'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('findMany');
      expect(request.args.distinct).toStrictEqual(false);
    })

    it('Should validate "distinct" option', async () => {
      await expect(() => adapter.parseRequest(HttpRequestMessage.create({
        method: 'GET',
        url: '/Customers?$distinct=x5'
      }))).rejects.toThrow('not a valid boolean');
    })

    it('Should parse "filter"', async () => {
      const request = await adapter.parseRequest(HttpRequestMessage.create({
        method: 'GET',
        url: '/Customers?$filter=givenname="John"'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('findMany');
      expect(request.args.filter).toBeDefined();
      expect(typeof request.args.filter).toStrictEqual('object');
    })

    it('Should validate if fields in "filter" option are exist', async () => {
      await expect(() => adapter.parseRequest(HttpRequestMessage.create({
            method: 'GET',
            url: '/Customers?$filter=address.x1=1'
          }))
      ).rejects.toThrow('Invalid field');
    })

  })

});

