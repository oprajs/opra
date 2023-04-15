import { ApiDocument, DocumentFactory, HttpRequestMessage, HttpRequestMessageHost } from '@opra/common';
import { OpraHttpAdapter, Request } from '@opra/core';
import { BestCustomerResource } from '../../_support/test-app/resource/best-customer.resource.js';
import { CustomersResource } from '../../_support/test-app/resource/customers.resource.js';

describe('OpraHttpAdapter parse Singleton requests', function () {

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

  describe('SingletonGetRequest', function () {

    it('Should parse request', async () => {
      const request = await adapter.parseRequest(
          new HttpRequestMessageHost({
            method: 'GET',
            url: '/BestCustomer?&$pick=id&$omit=gender&$include=address',
            headers: {'Accept': 'application/json'}
          })
      );
      expect(request).toBeDefined();
      const resource = document.getSingleton('BestCustomer');
      expect(request.resource).toStrictEqual(resource);
      expect(request.kind).toStrictEqual('SingletonGetRequest');
      expect(request.resourceKind).toStrictEqual('Singleton');
      expect(request.operation).toStrictEqual('get');
      expect(request.crud).toStrictEqual('read');
      expect(request.many).toStrictEqual(false);
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
        url: '/BestCustomer?$pick=givenname,GENDER,AdDRess.CIty'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('get');
      expect(request.args.pick).toStrictEqual(['givenName', 'gender', 'address.city']);
      request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'GET',
        url: '/BestCustomer?$pick=address,address.city'
      }));
      expect(request.operation).toStrictEqual('get');
      expect(request.args.pick).toStrictEqual(['address']);
      request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'GET',
        url: '/BestCustomer?$pick=address.city,address'
      }));
      expect(request.operation).toStrictEqual('get');
      expect(request.args.pick).toStrictEqual(['address']);
    })

    it('Should normalize element names in "omit" option', async () => {
      let request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'GET',
        url: '/BestCustomer?$omit=givenname,GENDER,AdDRess.CIty'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('get');
      expect(request.args.omit).toStrictEqual(['givenName', 'gender', 'address.city']);
      request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'GET',
        url: '/BestCustomer?$omit=address,address.city'
      }));
      expect(request.operation).toStrictEqual('get');
      expect(request.args.omit).toStrictEqual(['address']);
      request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'GET',
        url: '/BestCustomer?$omit=address.city,address'
      }));
      expect(request.operation).toStrictEqual('get');
      expect(request.args.omit).toStrictEqual(['address']);
    })

    it('Should normalize element names in "include" option', async () => {
      let request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'GET',
        url: '/BestCustomer?$include=givenname,GENDER,AdDRess.CIty'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('get');
      expect(request.args.include).toStrictEqual(['givenName', 'gender', 'address.city']);
      request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'GET',
        url: '/BestCustomer?$include=address,address.city'
      }));
      expect(request.operation).toStrictEqual('get');
      expect(request.args.include).toStrictEqual(['address']);
      request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'GET',
        url: '/BestCustomer?$include=address.city,address'
      }));
      expect(request.operation).toStrictEqual('get');
      expect(request.args.include).toStrictEqual(['address']);
    })

    it('Should validate if fields in "pick" option are exist', async () => {
      await expect(() => adapter.parseRequest(new HttpRequestMessageHost({
            method: 'GET',
            url: '/BestCustomer?$pick=address.x1'
          }))
      ).rejects.toThrow('Unknown element "address.x1"');
    })

    it('Should validate if fields in "omit" option are exist', async () => {
      await expect(() => adapter.parseRequest(new HttpRequestMessageHost({
            method: 'GET',
            url: '/BestCustomer?$omit=address.x1'
          }))
      ).rejects.toThrow('Unknown element "address.x1"');
    })

    it('Should validate if fields in "include" option are exist', async () => {
      await expect(() => adapter.parseRequest(new HttpRequestMessageHost({
            method: 'GET',
            url: '/BestCustomer?$include=address.x1'
          }))
      ).rejects.toThrow('Unknown element "address.x1"');
    })

    it('Should allow unknown fields in "pick" option if additionalFields set to "true"', async () => {
      const request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'GET',
        url: '/BestCustomer?$pick=notes.add1,notes.add2.add3'
      }));
      expect(request).toBeDefined();
      expect(request.args.pick).toStrictEqual(['notes.add1', 'notes.add2.add3']);
    })

    it('Should allow unknown fields in "omit" option if additionalFields set to "true"', async () => {
      const request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'GET',
        url: '/BestCustomer?$omit=notes.add1,notes.add2.add3'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('get');
      expect(request.args.omit).toStrictEqual(['notes.add1', 'notes.add2.add3']);
    })

    it('Should allow unknown fields in "include" option if additionalFields set to "true"', async () => {
      const request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'GET',
        url: '/BestCustomer?$include=notes.add1,notes.add2.add3'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('get');
      expect(request.args.include).toStrictEqual(['notes.add1', 'notes.add2.add3']);
    })

  });


  describe('SingletonCreateRequest', function () {

    it('Should parse request', async () => {
      const request = await adapter.parseRequest(
          new HttpRequestMessageHost({
            method: 'POST',
            url: '/BestCustomer',
            body: {name: 'John'},
            headers: {'content-type': 'application/json', 'Accept': 'application/json'}
          })
      );
      expect(request).toBeDefined();
      const resource = document.getSingleton('BestCustomer');
      expect(request.resource).toStrictEqual(resource);
      expect(request.kind).toStrictEqual('SingletonCreateRequest');
      expect(request.resourceKind).toStrictEqual('Singleton');
      expect(request.operation).toStrictEqual('create');
      expect(request.crud).toStrictEqual('create');
      expect(request.many).toStrictEqual(false);
      expect(request.args.data).toStrictEqual({name: 'John'});
      expect(() => request.switchToHttp()).not.toThrow();
      expect(request.switchToHttp().headers).toBeDefined();
      expect(request.switchToHttp().headers.accept).toStrictEqual('application/json');
    })

    it('Should normalize element names in "pick" option', async () => {
      let request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'POST',
        url: '/BestCustomer?$pick=givenname,GENDER,AdDRess.CIty',
        body: {id: 1},
        headers: {'content-type': 'application/json'}
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('create');
      expect(request.args.pick).toStrictEqual(['givenName', 'gender', 'address.city']);
      request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'POST',
        url: '/BestCustomer?$pick=address,address.city',
        body: {id: 1},
        headers: {'content-type': 'application/json'}
      }));
      expect(request.operation).toStrictEqual('create');
      expect(request.args.pick).toStrictEqual(['address']);
      request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'POST',
        url: '/BestCustomer?$pick=address.city,address',
        body: {id: 1},
        headers: {'content-type': 'application/json'}
      }));
      expect(request.operation).toStrictEqual('create');
      expect(request.args.pick).toStrictEqual(['address']);
    })

    it('Should normalize element names in "omit" option', async () => {
      let request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'POST',
        url: '/BestCustomer?$omit=givenname,GENDER,AdDRess.CIty',
        body: {id: 1},
        headers: {'content-type': 'application/json'}
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('create');
      expect(request.args.omit).toStrictEqual(['givenName', 'gender', 'address.city']);
      request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'POST',
        url: '/BestCustomer?$omit=address,address.city',
        body: {id: 1},
        headers: {'content-type': 'application/json'}
      }));
      expect(request.operation).toStrictEqual('create');
      expect(request.args.omit).toStrictEqual(['address']);
      request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'POST',
        url: '/BestCustomer?$omit=address.city,address',
        body: {id: 1},
        headers: {'content-type': 'application/json'}
      }));
      expect(request.operation).toStrictEqual('create');
      expect(request.args.omit).toStrictEqual(['address']);
    })

    it('Should normalize element names in "include" option', async () => {
      let request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'POST',
        url: '/BestCustomer?$include=givenname,GENDER,AdDRess.CIty',
        body: {id: 1},
        headers: {'content-type': 'application/json'}
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('create');
      expect(request.args.include).toStrictEqual(['givenName', 'gender', 'address.city']);
      request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'POST',
        url: '/BestCustomer?$include=address,address.city',
        body: {id: 1},
        headers: {'content-type': 'application/json'}
      }));
      expect(request.operation).toStrictEqual('create');
      expect(request.args.include).toStrictEqual(['address']);
      request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'POST',
        url: '/BestCustomer?$include=address.city,address'
      }));
      expect(request.operation).toStrictEqual('create');
      expect(request.args.include).toStrictEqual(['address']);
    })

    it('Should validate if fields in "pick" option are exist', async () => {
      await expect(() => adapter.parseRequest(new HttpRequestMessageHost({
            method: 'POST',
            url: '/BestCustomer?$pick=address.x1',
            body: {id: 1},
            headers: {'content-type': 'application/json'}
          }))
      ).rejects.toThrow('Unknown element "address.x1"');
    })

    it('Should validate if fields in "omit" option are exist', async () => {
      await expect(() => adapter.parseRequest(new HttpRequestMessageHost({
            method: 'POST',
            url: '/BestCustomer?$omit=address.x1',
            body: {id: 1},
            headers: {'content-type': 'application/json'}
          }))
      ).rejects.toThrow('Unknown element "address.x1"');
    })

    it('Should validate if fields in "include" option are exist', async () => {
      await expect(() => adapter.parseRequest(new HttpRequestMessageHost({
            method: 'POST',
            url: '/BestCustomer?$include=address.x1',
            body: {id: 1},
            headers: {'content-type': 'application/json'}
          }))
      ).rejects.toThrow('Unknown element "address.x1"');
    })

    it('Should allow unknown fields in "pick" option if additionalFields set to "true"', async () => {
      const request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'POST',
        url: '/BestCustomer?$pick=notes.add1,notes.add2.add3',
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
        url: '/BestCustomer?$omit=notes.add1,notes.add2.add3',
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
        url: '/BestCustomer?$include=notes.add1,notes.add2.add3',
        body: {id: 1},
        headers: {'content-type': 'application/json'}
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('create');
      expect(request.args.include).toStrictEqual(['notes.add1', 'notes.add2.add3']);
    })

  });

  describe('SingletonUpdateRequest', function () {

    it('Should parse request', async () => {
      const request = await adapter.parseRequest(
          new HttpRequestMessageHost({
            method: 'PATCH',
            url: '/BestCustomer',
            body: {name: 'John'},
            headers: {'content-type': 'application/json', 'Accept': 'application/json'}
          })
      );
      expect(request).toBeDefined();
      const resource = document.getSingleton('BestCustomer');
      expect(request.resource).toStrictEqual(resource);
      expect(request.kind).toStrictEqual('SingletonUpdateRequest');
      expect(request.resourceKind).toStrictEqual('Singleton');
      expect(request.operation).toStrictEqual('update');
      expect(request.crud).toStrictEqual('update');
      expect(request.many).toStrictEqual(false);
      expect(request.args.data).toStrictEqual({name: 'John'});
      expect(() => request.switchToHttp()).not.toThrow();
      expect(request.switchToHttp().headers).toBeDefined();
      expect(request.switchToHttp().headers.accept).toStrictEqual('application/json');
    })

    it('Should normalize element names in "pick" option', async () => {
      let request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'PATCH',
        url: '/BestCustomer?$pick=givenname,GENDER,AdDRess.CIty',
        body: {id: 1},
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('update');
      expect(request.args.pick).toStrictEqual(['givenName', 'gender', 'address.city']);
      request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'PATCH',
        url: '/BestCustomer?$pick=address,address.city'
      }));
      expect(request.operation).toStrictEqual('update');
      expect(request.args.pick).toStrictEqual(['address']);
      request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'PATCH',
        url: '/BestCustomer?$pick=address.city,address',
        body: {id: 1},
      }));
      expect(request.operation).toStrictEqual('update');
      expect(request.args.pick).toStrictEqual(['address']);
    })

    it('Should normalize element names in "omit" option', async () => {
      let request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'PATCH',
        url: '/BestCustomer?$omit=givenname,GENDER,AdDRess.CIty',
        body: {id: 1},
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('update');
      expect(request.args.omit).toStrictEqual(['givenName', 'gender', 'address.city']);
      request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'PATCH',
        url: '/BestCustomer?$omit=address,address.city',
        body: {id: 1},
      }));
      expect(request.operation).toStrictEqual('update');
      expect(request.args.omit).toStrictEqual(['address']);
      request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'PATCH',
        url: '/BestCustomer?$omit=address.city,address',
        body: {id: 1},
      }));
      expect(request.operation).toStrictEqual('update');
      expect(request.args.omit).toStrictEqual(['address']);
    })

    it('Should normalize element names in "include" option', async () => {
      let request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'PATCH',
        url: '/BestCustomer?$include=givenname,GENDER,AdDRess.CIty',
        body: {id: 1},
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('update');
      expect(request.args.include).toStrictEqual(['givenName', 'gender', 'address.city']);
      request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'PATCH',
        url: '/BestCustomer?$include=address,address.city',
        body: {id: 1},
      }));
      expect(request.operation).toStrictEqual('update');
      expect(request.args.include).toStrictEqual(['address']);
      request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'PATCH',
        url: '/BestCustomer?$include=address.city,address',
        body: {id: 1},
      }));
      expect(request.operation).toStrictEqual('update');
      expect(request.args.include).toStrictEqual(['address']);
    })

    it('Should validate if fields in "pick" option are exist', async () => {
      await expect(() => adapter.parseRequest(new HttpRequestMessageHost({
            method: 'PATCH',
            url: '/BestCustomer?$pick=address.x1',
            body: {id: 1},
          }))
      ).rejects.toThrow('Unknown element "address.x1"');
    })

    it('Should validate if fields in "omit" option are exist', async () => {
      await expect(() => adapter.parseRequest(new HttpRequestMessageHost({
            method: 'PATCH',
            url: '/BestCustomer?$omit=address.x1',
            body: {id: 1},
          }))
      ).rejects.toThrow('Unknown element "address.x1"');
    })

    it('Should validate if fields in "include" option are exist', async () => {
      await expect(() => adapter.parseRequest(new HttpRequestMessageHost({
            method: 'PATCH',
            url: '/BestCustomer?$include=address.x1',
            body: {id: 1},
          }))
      ).rejects.toThrow('Unknown element "address.x1"');
    })

    it('Should allow unknown fields in "pick" option if additionalFields set to "true"', async () => {
      const request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'PATCH',
        url: '/BestCustomer?$pick=notes.add1,notes.add2.add3',
        body: {id: 1},
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('update');
      expect(request.args.pick).toStrictEqual(['notes.add1', 'notes.add2.add3']);
    })

    it('Should allow unknown fields in "omit" option if additionalFields set to "true"', async () => {
      const request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'PATCH',
        url: '/BestCustomer?$omit=notes.add1,notes.add2.add3',
        body: {id: 1},
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('update');
      expect(request.args.omit).toStrictEqual(['notes.add1', 'notes.add2.add3']);
    })

    it('Should allow unknown fields in "include" option if additionalFields set to "true"', async () => {
      const request = await adapter.parseRequest(new HttpRequestMessageHost({
        method: 'PATCH',
        url: '/BestCustomer?$include=notes.add1,notes.add2.add3',
        body: {id: 1},
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('update');
      expect(request.args.include).toStrictEqual(['notes.add1', 'notes.add2.add3']);
    })

  });

  describe('SingletonDeleteRequest', function () {

    it('Should parse request', async () => {
      const request = await adapter.parseRequest(
          new HttpRequestMessageHost({
            method: 'DELETE',
            url: '/BestCustomer',
            headers: {'Accept': 'application/json'}
          })
      );
      expect(request).toBeDefined();
      const resource = document.getSingleton('BestCustomer');
      expect(request.resource).toStrictEqual(resource);
      expect(request.kind).toStrictEqual('SingletonDeleteRequest');
      expect(request.resourceKind).toStrictEqual('Singleton');
      expect(request.operation).toStrictEqual('delete');
      expect(request.crud).toStrictEqual('delete');
      expect(request.many).toStrictEqual(false);
      expect(() => request.switchToHttp()).not.toThrow();
      expect(request.switchToHttp().headers).toBeDefined();
      expect(request.switchToHttp().headers.accept).toStrictEqual('application/json');
    })

  });

});

