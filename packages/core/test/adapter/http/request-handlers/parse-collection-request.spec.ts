import { ApiDocument, Collection } from '@opra/common';
import { HttpAdapter, HttpServerRequest } from '@opra/core';
import { EntityRequestHandler } from '../../../../src/adapter/http/request-handlers/entity-request-handler.js';
import { createTestApi } from '../../../_support/test-app/index.js';

describe('Parse Collection requests', function () {

  let api: ApiDocument;
  let requestHandler: EntityRequestHandler;

  beforeAll(async () => {
    api = await createTestApi();
    const adapter = await HttpAdapter.create(api);
    requestHandler = new EntityRequestHandler(adapter as any);
  });

  describe('parse "get" operation', function () {

    it('Should parse request', async () => {
      const request = await requestHandler.parseRequest(
          HttpServerRequest.from({
            method: 'GET',
            url: '/Customers@1?$pick=_id&$omit=gender&$include=address',
            headers: {'Accept': 'application/json'}
          })) as Collection.Get.Request;
      expect(request).toBeDefined();
      const resource = api.getCollection('Customers');
      expect(request.resource).toStrictEqual(resource);
      expect(request.endpoint).toStrictEqual('get');
      expect(request.key).toStrictEqual(1);
      expect(request.params.pick).toStrictEqual(['_id']);
      expect(request.params.omit).toStrictEqual(['gender']);
      expect(request.params.include).toStrictEqual(['address']);
      expect(() => request.switchToHttp()).not.toThrow();
      expect(request.switchToHttp().headers).toBeDefined();
      expect(request.switchToHttp().headers.accept).toStrictEqual('application/json');
    })

    it('Should normalize field names in "pick" option', async () => {
      const request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'GET',
        url: '/Customers@1?$pick=givenname,GENDER,Address,address.countryCode'
      })) as Collection.Get.Request;
      expect(request).toBeDefined();
      expect(request.endpoint).toStrictEqual('get');
      expect(request.params.pick).toStrictEqual(['givenName', 'gender', 'address', 'address.countryCode']);
    })

    it('Should normalize field names in "omit" option', async () => {
      let request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'GET',
        url: '/Customers@1?$omit=givenname,GENDER,address.countryCode'
      })) as Collection.Get.Request;
      expect(request).toBeDefined();
      expect(request.endpoint).toStrictEqual('get');
      expect(request.params.omit).toStrictEqual(['givenName', 'gender', 'address.countryCode']);
      request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'GET',
        url: '/Customers@1?$omit=address,address.countryCode'
      })) as Collection.Get.Request;
      expect(request.endpoint).toStrictEqual('get');
      expect(request.params.omit).toStrictEqual(['address', 'address.countryCode']);
    })

    it('Should normalize field names in "include" option', async () => {
      let request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'GET',
        url: '/Customers@1?$include=givenname,GENDER,address.countryCode'
      })) as Collection.Get.Request;
      expect(request).toBeDefined();
      expect(request.endpoint).toStrictEqual('get');
      expect(request.params.include).toStrictEqual(['givenName', 'gender', 'address.countryCode']);
      request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'GET',
        url: '/Customers@1?$include=address,address.countryCode'
      })) as Collection.Get.Request;
      expect(request.params.include).toStrictEqual(['address', 'address.countryCode']);
    })

    it('Should validate if fields in "pick" option are exist', async () => {
      await expect(() => requestHandler.parseRequest(HttpServerRequest.from({
            method: 'GET',
            url: '/Customers@1?$pick=address.x1'
          }))
      ).rejects.toThrow('UNKNOWN_FIELD');
    })

    it('Should validate if fields in "omit" option are exist', async () => {
      await expect(() => requestHandler.parseRequest(HttpServerRequest.from({
            method: 'GET',
            url: '/Customers@1?$omit=address.x1'
          }))
      ).rejects.toThrow('UNKNOWN_FIELD');
    })

    it('Should validate if fields in "include" option are exist', async () => {
      await expect(() => requestHandler.parseRequest(HttpServerRequest.from({
            method: 'GET',
            url: '/Customers@1?$include=address.x1'
          }))
      ).rejects.toThrow('UNKNOWN_FIELD');
    })

    it('Should allow unknown fields in "pick" option if additionalFields set to "true"', async () => {
      const request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'GET',
        url: '/Customers@1?$pick=notes.add1,notes.add2.add3'
      })) as Collection.Get.Request;
      expect(request).toBeDefined();
      expect(request.endpoint).toStrictEqual('get');
      expect(request.params.pick).toStrictEqual(['notes.add1', 'notes.add2.add3']);
    })

    it('Should allow unknown fields in "omit" option if additionalFields set to "true"', async () => {
      const request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'GET',
        url: '/Customers@1?$omit=notes.add1,notes.add2.add3'
      })) as Collection.Get.Request;
      expect(request).toBeDefined();
      expect(request.endpoint).toStrictEqual('get');
      expect(request.params.omit).toStrictEqual(['notes.add1', 'notes.add2.add3']);
    })

    it('Should allow unknown fields in "include" option if additionalFields set to "true"', async () => {
      const request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'GET',
        url: '/Customers@1?$include=notes.add1,notes.add2.add3'
      })) as Collection.Get.Request;
      expect(request).toBeDefined();
      expect(request.endpoint).toStrictEqual('get');
      expect(request.params.include).toStrictEqual(['notes.add1', 'notes.add2.add3']);
    })

  })

  describe('parse "create" operation', function () {

    it('Should parse request', async () => {
      const request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'POST',
        url: '/Customers?$pick=_id&$omit=gender&$include=address',
        body: {_id: 1},
        headers: {'content-type': 'application/json', 'Accept': 'application/json'}
      })) as Collection.Create.Request;
      expect(request).toBeDefined();
      const resource = api.getCollection('Customers');
      expect(request?.resource).toStrictEqual(resource);
      expect(request?.endpoint).toStrictEqual('create');
      expect(request?.data).toEqual({_id: 1});
      expect(request?.params.pick).toStrictEqual(['_id']);
      expect(request?.params.omit).toStrictEqual(['gender']);
      expect(request?.params.include).toStrictEqual(['address']);
      expect(() => request?.switchToHttp()).not.toThrow();
      expect(request?.switchToHttp().headers).toBeDefined();
      expect(request?.switchToHttp().headers).toMatchObject({
        'content-type': 'application/json',
        'accept': 'application/json'
      });
    })

    it('Should normalize field names in "pick" option', async () => {
      const request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'POST',
        url: '/Customers?$pick=givenname,GENDER,address,address.countryCode',
        body: {_id: 1},
        headers: {'content-type': 'application/json'}
      })) as Collection.Create.Request;
      expect(request).toBeDefined();
      expect(request?.endpoint).toStrictEqual('create');
      expect(request?.params.pick).toStrictEqual(['givenName', 'gender', 'address', 'address.countryCode']);
    })

    it('Should normalize field names in "omit" option', async () => {
      const request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'POST',
        url: '/Customers?$omit=givenname,GENDER,address,address.countryCode',
        body: {_id: 1},
        headers: {'content-type': 'application/json'}
      })) as Collection.Create.Request;
      expect(request).toBeDefined();
      expect(request?.endpoint).toStrictEqual('create');
      expect(request?.params.omit).toStrictEqual(['givenName', 'gender', 'address', 'address.countryCode']);
    })

    it('Should normalize field names in "include" option', async () => {
      const request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'POST',
        url: '/Customers?$include=givenname,GENDER,address,address.countryCode',
        body: {_id: 1},
        headers: {'content-type': 'application/json'}
      })) as Collection.Create.Request;
      expect(request).toBeDefined();
      expect(request?.endpoint).toStrictEqual('create');
      expect(request?.params.include).toStrictEqual(['givenName', 'gender', 'address', 'address.countryCode']);
    })

    it('Should validate if fields in "pick" option are exist', async () => {
      await expect(() => requestHandler.parseRequest(HttpServerRequest.from({
            method: 'POST',
            url: '/Customers?$pick=address.x1',
            body: {_id: 1},
            headers: {'content-type': 'application/json'}
          }))
      ).rejects.toThrow('UNKNOWN_FIELD');
    })

    it('Should validate if fields in "omit" option are exist', async () => {
      await expect(() => requestHandler.parseRequest(HttpServerRequest.from({
            method: 'POST',
            url: '/Customers?$omit=address.x1',
            body: {_id: 1},
            headers: {'content-type': 'application/json'}
          }))
      ).rejects.toThrow('UNKNOWN_FIELD');
    })

    it('Should validate if fields in "include" option are exist', async () => {
      await expect(() => requestHandler.parseRequest(HttpServerRequest.from({
            method: 'POST',
            url: '/Customers?$include=address.x1',
            body: {_id: 1},
            headers: {'content-type': 'application/json'}
          }))
      ).rejects.toThrow('UNKNOWN_FIELD');
    })

    it('Should allow unknown fields in "pick" option if additionalFields set to "true"', async () => {
      const request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'POST',
        url: '/Customers?$pick=notes.add1,notes.add2.add3',
        body: {_id: 1},
        headers: {'content-type': 'application/json'}
      })) as Collection.Create.Request;
      expect(request).toBeDefined();
      expect(request?.endpoint).toStrictEqual('create');
      expect(request?.params.pick).toStrictEqual(['notes.add1', 'notes.add2.add3']);
    })

    it('Should allow unknown fields in "omit" option if additionalFields set to "true"', async () => {
      const request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'POST',
        url: '/Customers?$omit=notes.add1,notes.add2.add3',
        body: {_id: 1},
        headers: {'content-type': 'application/json'}
      })) as Collection.Create.Request;
      expect(request).toBeDefined();
      expect(request?.endpoint).toStrictEqual('create');
      expect(request?.params.omit).toStrictEqual(['notes.add1', 'notes.add2.add3']);
    })

    it('Should allow unknown fields in "include" option if additionalFields set to "true"', async () => {
      const request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'POST',
        url: '/Customers?$include=notes.add1,notes.add2.add3',
        body: {_id: 1},
        headers: {'content-type': 'application/json'}
      })) as Collection.Create.Request;
      expect(request).toBeDefined();
      expect(request?.params.include).toStrictEqual(['notes.add1', 'notes.add2.add3']);
    })

  });


  describe('parse "update" operation', function () {

    it('Should parse request', async () => {
      const request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'PATCH',
        url: '/Customers@1?$pick=_id&$omit=gender&$include=address',
        body: {_id: 1},
        headers: {'content-type': 'application/json', 'Accept': 'application/json'}
      })) as Collection.Update.Request;
      expect(request).toBeDefined();
      const resource = api.getCollection('Customers');
      expect(request?.resource).toStrictEqual(resource);
      expect(request?.endpoint).toStrictEqual('update');
      expect(request?.key).toStrictEqual(1);
      expect(request?.data).toEqual({_id: 1});
      expect(request?.params.pick).toStrictEqual(['_id']);
      expect(request?.params.omit).toStrictEqual(['gender']);
      expect(request?.params.include).toStrictEqual(['address']);
      expect(() => request?.switchToHttp()).not.toThrow();
      expect(request?.switchToHttp().headers).toBeDefined();
      expect(request?.switchToHttp().headers.accept).toStrictEqual('application/json');
    })

    it('Should normalize field names in "pick" option', async () => {
      const request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'PATCH',
        url: '/Customers@1?$pick=givenname,GENDER,Address,address.countryCode',
        headers: ['content-type', 'application/json'],
        body: {_id: 1}
      })) as Collection.Update.Request;
      expect(request).toBeDefined();
      expect(request?.endpoint).toStrictEqual('update');
      expect(request?.params.pick).toStrictEqual(['givenName', 'gender', 'address', 'address.countryCode']);
    })

    it('Should normalize field names in "omit" option', async () => {
      const request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'PATCH',
        url: '/Customers@1?$omit=givenname,GENDER,Address,address.countryCode',
        headers: ['content-type', 'application/json'],
        body: {_id: 1},
      })) as Collection.Update.Request;
      expect(request).toBeDefined();
      expect(request?.endpoint).toStrictEqual('update');
      expect(request?.params.omit).toStrictEqual(['givenName', 'gender', 'address', 'address.countryCode']);
    })

    it('Should normalize field names in "include" option', async () => {
      const request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'PATCH',
        url: '/Customers@1?$include=givenname,GENDER,Address,address.countryCode',
        headers: ['content-type', 'application/json'],
        body: {_id: 1},
      })) as Collection.Update.Request;
      expect(request).toBeDefined();
      expect(request?.endpoint).toStrictEqual('update');
      expect(request?.params.include).toStrictEqual(['givenName', 'gender', 'address', 'address.countryCode']);
    })

    it('Should validate if fields in "pick" option are exist', async () => {
      await expect(() => requestHandler.parseRequest(HttpServerRequest.from({
            method: 'PATCH',
            url: '/Customers@1?$pick=address.x1',
            headers: ['content-type', 'application/json'],
            body: {_id: 1},
          }))
      ).rejects.toThrow('UNKNOWN_FIELD');
    })

    it('Should validate if fields in "omit" option are exist', async () => {
      await expect(() => requestHandler.parseRequest(HttpServerRequest.from({
            method: 'PATCH',
            url: '/Customers@1?$omit=address.x1',
            headers: ['content-type', 'application/json'],
            body: {_id: 1},
          }))
      ).rejects.toThrow('UNKNOWN_FIELD');
    })

    it('Should validate if fields in "include" option are exist', async () => {
      await expect(() => requestHandler.parseRequest(HttpServerRequest.from({
            method: 'PATCH',
            url: '/Customers@1?$include=address.x1',
            headers: ['content-type', 'application/json'],
            body: {_id: 1},
          }))
      ).rejects.toThrow('UNKNOWN_FIELD');
    })

    it('Should allow unknown fields in "pick" option if additionalFields set to "true"', async () => {
      const request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'PATCH',
        url: '/Customers@1?$pick=notes.add1,notes.add2.add3',
        headers: ['content-type', 'application/json'],
        body: {_id: 1},
      })) as Collection.Update.Request;
      expect(request).toBeDefined();
      expect(request?.endpoint).toStrictEqual('update');
      expect(request?.params.pick).toStrictEqual(['notes.add1', 'notes.add2.add3']);
    })

    it('Should allow unknown fields in "omit" option if additionalFields set to "true"', async () => {
      const request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'PATCH',
        url: '/Customers@1?$omit=notes.add1,notes.add2.add3',
        headers: ['content-type', 'application/json'],
        body: {_id: 1},
      })) as Collection.Update.Request;
      expect(request).toBeDefined();
      expect(request?.endpoint).toStrictEqual('update');
      expect(request?.params.omit).toStrictEqual(['notes.add1', 'notes.add2.add3']);
    })

    it('Should allow unknown fields in "include" option if additionalFields set to "true"', async () => {
      const request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'PATCH',
        url: '/Customers@1?$include=notes.add1,notes.add2.add3',
        headers: ['content-type', 'application/json'],
        body: {_id: 1},
      })) as Collection.Update.Request;
      expect(request).toBeDefined();
      expect(request?.endpoint).toStrictEqual('update');
      expect(request?.params.include).toStrictEqual(['notes.add1', 'notes.add2.add3']);
    })

  });


  describe('parse "updateMany" operation', function () {

    it('Should parse request', async () => {
      const request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'PATCH',
        url: '/Customers',
        body: {_id: 1},
        headers: {'content-type': 'application/json', 'Accept': 'application/json'}
      })) as Collection.UpdateMany.Request;
      expect(request).toBeDefined();
      const resource = api.getCollection('Customers');
      expect(request?.resource).toStrictEqual(resource);
      expect(request?.endpoint).toStrictEqual('updateMany');
      expect(request?.data).toEqual({_id: 1});
      expect(() => request?.switchToHttp()).not.toThrow();
      expect(request?.switchToHttp().headers).toBeDefined();
      expect(request?.switchToHttp().headers.accept).toStrictEqual('application/json');
    })

    it('Should parse "filter"', async () => {
      const request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'PATCH',
        url: '/Customers?$filter=givenname="John"',
        body: {_id: 1},
        headers: {'content-type': 'application/json', 'Accept': 'application/json'}
      })) as Collection.UpdateMany.Request;
      expect(request).toBeDefined();
      expect(request?.endpoint).toStrictEqual('updateMany');
      expect(request?.params.filter).toBeDefined();
      expect(typeof request?.params.filter).toStrictEqual('object');
    })

    it('Should validate if fields in "filter" option are exist', async () => {
      await expect(() => requestHandler.parseRequest(HttpServerRequest.from({
            method: 'PATCH',
            url: '/Customers?$filter=address.x1=1',
            body: {_id: 1},
            headers: {'content-type': 'application/json', 'Accept': 'application/json'}
          }))
      ).rejects.toThrow('UNKNOWN_FIELD');
    })

  });


  describe('parse "delete" operation', function () {

    it('Should parse request', async () => {
      const request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'DELETE',
        url: '/Customers@1',
        headers: {'Accept': 'application/json'}
      })) as Collection.Delete.Request;
      expect(request).toBeDefined();
      const resource = api.getCollection('Customers');
      expect(request?.resource).toStrictEqual(resource);
      expect(request?.endpoint).toStrictEqual('delete');
      expect(request?.key).toStrictEqual(1);
      expect(() => request?.switchToHttp()).not.toThrow();
      expect(request?.switchToHttp().headers).toBeDefined();
      expect(request?.switchToHttp().headers.accept).toStrictEqual('application/json');
    })

  })

  describe('parse "deleteMany" operation', function () {

    it('Should parse request', async () => {
      const request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'DELETE',
        url: '/Customers?$filter=_id<10',
        headers: {'Accept': 'application/json'}
      })) as Collection.DeleteMany.Request;
      expect(request).toBeDefined();
      const resource = api.getCollection('Customers');
      expect(request?.resource).toStrictEqual(resource);
      expect(request?.endpoint).toStrictEqual('deleteMany');
      expect(request?.params.filter).toBeDefined();
      expect(() => request?.switchToHttp()).not.toThrow();
      expect(request?.switchToHttp().headers).toBeDefined();
      expect(request?.switchToHttp().headers.accept).toStrictEqual('application/json');
    })

    it('Should parse "filter"', async () => {
      const request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'DELETE',
        url: '/Customers?$filter=givenname="John"'
      })) as Collection.DeleteMany.Request;
      expect(request).toBeDefined();
      expect(request?.endpoint).toStrictEqual('deleteMany');
      expect(request?.params.filter).toBeDefined();
      expect(typeof request?.params.filter).toStrictEqual('object');
    })

    it('Should validate if fields in "filter" option are exist', async () => {
      await expect(() => requestHandler.parseRequest(HttpServerRequest.from({
            method: 'DELETE',
            url: '/Customers?$filter=address.x1=1'
          }))
      ).rejects.toThrow('UNKNOWN_FIELD');
    })

  })


  describe('parse "findMany" operation', function () {

    it('Should parse request', async () => {
      const request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'GET',
        url: '/Customers?$limit=1&$skip=1&$count=n&$distinct=t&$sort=_id' +
            '&$pick=_id&$omit=gender&$include=address',
        headers: {'Accept': 'application/json'}
      })) as Collection.FindMany.Request;
      expect(request).toBeDefined();
      const resource = api.getCollection('Customers');
      expect(request?.resource).toStrictEqual(resource);
      expect(request?.endpoint).toStrictEqual('findMany');
      expect(request?.params.skip).toStrictEqual(1);
      expect(request?.params.count).toStrictEqual(false);
      expect(request?.params.skip).toStrictEqual(1);
      expect(request?.params.distinct).toStrictEqual(true);
      expect(request?.params.sort).toStrictEqual(['_id']);
      expect(request?.params.pick).toStrictEqual(['_id']);
      expect(request?.params.omit).toStrictEqual(['gender']);
      expect(request?.params.include).toStrictEqual(['address']);

      expect(() => request?.switchToHttp()).not.toThrow();
      expect(request?.switchToHttp().headers).toBeDefined();
      expect(request?.switchToHttp().headers.accept).toStrictEqual('application/json');
    })

    it('Should normalize field names in "pick" option', async () => {
      const request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'GET',
        url: '/Customers@1?$pick=givenname,GENDER,Address,address.countryCode'
      })) as Collection.FindMany.Request;
      expect(request).toBeDefined();
      expect(request?.endpoint).toStrictEqual('get');
      expect(request?.params.pick).toStrictEqual(['givenName', 'gender', 'address', 'address.countryCode']);
    })

    it('Should normalize field names in "omit" option', async () => {
      const request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'GET',
        url: '/Customers@1?$omit=givenname,GENDER,Address,address.countryCode'
      })) as Collection.FindMany.Request;
      expect(request).toBeDefined();
      expect(request?.params.omit).toStrictEqual(['givenName', 'gender', 'address', 'address.countryCode']);
    })

    it('Should normalize field names in "include" option', async () => {
      const request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'GET',
        url: '/Customers@1?$include=givenname,GENDER,Address,address.countryCode'
      })) as Collection.FindMany.Request;
      expect(request).toBeDefined();
      expect(request?.endpoint).toStrictEqual('get');
      expect(request?.params.include).toStrictEqual(['givenName', 'gender', 'address', 'address.countryCode']);
    })

    it('Should normalize field names in "sort" option', async () => {
      const request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'GET',
        url: '/Customers?$sort=givenname,GENDER,address.countryCode'
      })) as Collection.FindMany.Request;
      expect(request).toBeDefined();
      expect(request?.endpoint).toStrictEqual('findMany');
      expect(request?.params.sort).toStrictEqual(['givenName', 'gender', 'address.countryCode']);
    })

    it('Should validate if fields in "pick" option are exist', async () => {
      await expect(() => requestHandler.parseRequest(HttpServerRequest.from({
            method: 'GET',
            url: '/Customers?$pick=address.x1'
          }))
      ).rejects.toThrow('UNKNOWN_FIELD');
    })

    it('Should validate if fields in "omit" option are exist', async () => {
      await expect(() => requestHandler.parseRequest(HttpServerRequest.from({
            method: 'GET',
            url: '/Customers?$omit=address.x1'
          }))
      ).rejects.toThrow('UNKNOWN_FIELD');
    })

    it('Should validate if fields in "include" option are exist', async () => {
      await expect(() => requestHandler.parseRequest(HttpServerRequest.from({
            method: 'GET',
            url: '/Customers?$include=address.x1'
          }))
      ).rejects.toThrow('UNKNOWN_FIELD');
    })

    it('Should validate if fields in "sort" option are exist', async () => {
      await expect(() => requestHandler.parseRequest(HttpServerRequest.from({
            method: 'GET',
            url: '/Customers?$sort=address.x1'
          }))
      ).rejects.toThrow('UNKNOWN_FIELD');
    })

    it('Should validate if field is available for sorting', async () => {
      await expect(() => requestHandler.parseRequest(HttpServerRequest.from({
            method: 'GET',
            url: '/Customers?$sort=uid'
          }))
      ).rejects.toThrow('UNACCEPTED_SORT_FIELD');
    })

    it('Should allow unknown fields in "pick" option if additionalFields set to "true"', async () => {
      const request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'GET',
        url: '/Customers?$pick=notes.add1,notes.add2.add3'
      })) as Collection.FindMany.Request;
      expect(request).toBeDefined();
      expect(request?.endpoint).toStrictEqual('findMany');
      expect(request?.params.pick).toStrictEqual(['notes.add1', 'notes.add2.add3']);
    })

    it('Should allow unknown fields in "omit" option if additionalFields set to "true"', async () => {
      const request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'GET',
        url: '/Customers?$omit=notes.add1,notes.add2.add3'
      })) as Collection.FindMany.Request;
      expect(request).toBeDefined();
      expect(request?.endpoint).toStrictEqual('findMany');
      expect(request?.params.omit).toStrictEqual(['notes.add1', 'notes.add2.add3']);
    })

    it('Should allow unknown fields in "include" option if additionalFields set to "true"', async () => {
      const request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'GET',
        url: '/Customers?$include=notes.add1,notes.add2.add3'
      })) as Collection.FindMany.Request;
      expect(request).toBeDefined();
      expect(request?.endpoint).toStrictEqual('findMany');
      expect(request?.params.include).toStrictEqual(['notes.add1', 'notes.add2.add3']);
    })

    it('Should parse "limit" option', async () => {
      const request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'GET',
        url: '/Customers?$limit=5'
      })) as Collection.FindMany.Request;
      expect(request).toBeDefined();
      expect(request?.params.limit).toStrictEqual(5);
    })

    it('Should validate "limit" option', async () => {
      await expect(() => requestHandler.parseRequest(HttpServerRequest.from({
        method: 'GET',
        url: '/Customers?$limit=x5'
      }))).rejects.toThrow('not a valid integer');
    })

    it('Should parse "skip" option', async () => {
      const request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'GET',
        url: '/Customers?$skip=5'
      })) as Collection.FindMany.Request;
      expect(request).toBeDefined();
      expect(request?.endpoint).toStrictEqual('findMany');
      expect(request?.params.skip).toStrictEqual(5);
    })

    it('Should validate "skip" option', async () => {
      await expect(() => requestHandler.parseRequest(HttpServerRequest.from({
        method: 'GET',
        url: '/Customers?$skip=x5'
      }))).rejects.toThrow('not a valid integer');
    })

    it('Should parse "count" option', async () => {
      let request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'GET',
        url: '/Customers?$count=true'
      })) as Collection.FindMany.Request;
      expect(request).toBeDefined();
      expect(request?.endpoint).toStrictEqual('findMany');
      expect(request?.params.count).toStrictEqual(true);
      request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'GET',
        url: '/Customers?$count=1'
      })) as Collection.FindMany.Request;
      expect(request).toBeDefined();
      expect(request?.endpoint).toStrictEqual('findMany');
      expect(request?.params.count).toStrictEqual(true);
      request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'GET',
        url: '/Customers?$count=t'
      })) as Collection.FindMany.Request;
      expect(request).toBeDefined();
      expect(request?.endpoint).toStrictEqual('findMany');
      expect(request?.params.count).toStrictEqual(true);
      request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'GET',
        url: '/Customers?$count=false'
      })) as Collection.FindMany.Request;
      expect(request).toBeDefined();
      expect(request?.endpoint).toStrictEqual('findMany');
      expect(request?.params.count).toStrictEqual(false);
      request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'GET',
        url: '/Customers?$count=0'
      })) as Collection.FindMany.Request;
      expect(request).toBeDefined();
      expect(request?.endpoint).toStrictEqual('findMany');
      expect(request?.params.count).toStrictEqual(false);
      request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'GET',
        url: '/Customers?$count=f'
      })) as Collection.FindMany.Request;
      expect(request).toBeDefined();
      expect(request?.endpoint).toStrictEqual('findMany');
      expect(request?.params.count).toStrictEqual(false);
    })

    it('Should parse "distinct" option', async () => {
      let request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'GET',
        url: '/Customers?$distinct=true'
      })) as Collection.FindMany.Request;
      expect(request).toBeDefined();
      expect(request?.endpoint).toStrictEqual('findMany');
      expect(request?.params.distinct).toStrictEqual(true);
      request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'GET',
        url: '/Customers?$distinct=1'
      })) as Collection.FindMany.Request;
      expect(request).toBeDefined();
      expect(request?.endpoint).toStrictEqual('findMany');
      expect(request?.params.distinct).toStrictEqual(true);
      request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'GET',
        url: '/Customers?$distinct=t'
      })) as Collection.FindMany.Request;
      expect(request).toBeDefined();
      expect(request?.endpoint).toStrictEqual('findMany');
      expect(request?.params.distinct).toStrictEqual(true);
      request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'GET',
        url: '/Customers?$distinct=false'
      })) as Collection.FindMany.Request;
      expect(request).toBeDefined();
      expect(request?.endpoint).toStrictEqual('findMany');
      expect(request?.params.distinct).toStrictEqual(false);
      request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'GET',
        url: '/Customers?$distinct=0'
      })) as Collection.FindMany.Request;
      expect(request).toBeDefined();
      expect(request?.endpoint).toStrictEqual('findMany');
      expect(request?.params.distinct).toStrictEqual(false);
      request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'GET',
        url: '/Customers?$distinct=f'
      })) as Collection.FindMany.Request;
      expect(request).toBeDefined();
      expect(request?.endpoint).toStrictEqual('findMany');
      expect(request?.params.distinct).toStrictEqual(false);
    })

    it('Should parse "filter"', async () => {
      const request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'GET',
        url: '/Customers?$filter=Givenname="John"'
      })) as Collection.FindMany.Request;
      expect(request).toBeDefined();
      expect(request?.endpoint).toStrictEqual('findMany');
      expect(request?.params.filter).toMatchObject({
        kind: 'ComparisonExpression',
        op: '=',
        left: {
          kind: 'QualifiedIdentifier',
          value: 'givenName'
        }
      });
    })

    it('Should validate if field exists in data type', async () => {
      await expect(() => requestHandler.parseRequest(HttpServerRequest.from({
            method: 'GET',
            url: '/Customers?$filter=address.x1=1'
          }))
      ).rejects.toThrow('UNKNOWN_FIELD');
    })

    it('Should validate if fields in "filter" option are exist', async () => {
      await expect(() => requestHandler.parseRequest(HttpServerRequest.from({
            method: 'GET',
            url: '/Customers?$filter=rate>=1'
          }))
      ).rejects.toThrow('UNACCEPTED_FILTER_FIELD');
    })

    it('Should validate operation accepted', async () => {
      await expect(() => requestHandler.parseRequest(HttpServerRequest.from({
            method: 'GET',
            url: '/Customers?$filter=gender>="M"'
          }))
      ).rejects.toThrow('UNACCEPTED_FILTER_OPERATION');
    })

  })

});

