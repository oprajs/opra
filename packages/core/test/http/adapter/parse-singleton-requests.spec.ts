import { ApiDocument, Singleton } from '@opra/common';
import { HttpAdapter, HttpServerRequest } from '@opra/core';
import { EntityRequestHandler } from '@opra/core/adapter/http/request-handlers/entity-request-handler';
import { createTestApi } from '../../_support/test-app/index.js';

describe('Parse Singleton requests', function () {

  let api: ApiDocument;
  let requestHandler: EntityRequestHandler;

  beforeAll(async () => {
    api = await createTestApi();
    const adapter = await HttpAdapter.create(api);
    requestHandler = new EntityRequestHandler(adapter as any);
  });

  describe('parse "get" operation', function () {

    it('Should parse request', async () => {
      const request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'GET',
        url: '/MyProfile?&$pick=_id&$omit=gender&$include=address',
        headers: {'Accept': 'application/json'}
      })) as Singleton.Get.Request;
      expect(request).toBeDefined();
      const resource = api.getSingleton('MyProfile');
      expect(request.resource).toStrictEqual(resource);
      expect(request.endpoint).toStrictEqual('get');
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
        url: '/MyProfile?$pick=givenname,GENDER,Address,address.countryCode'
      })) as Singleton.Get.Request;
      expect(request).toBeDefined();
      expect(request.endpoint).toStrictEqual('get');
      expect(request.params.pick).toStrictEqual(['givenName', 'gender', 'address', 'address.countryCode']);
    })

    it('Should normalize field names in "omit" option', async () => {
      const request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'GET',
        url: '/MyProfile?$omit=givenname,GENDER,Address,address.countryCode'
      })) as Singleton.Get.Request;
      expect(request).toBeDefined();
      expect(request.endpoint).toStrictEqual('get');
      expect(request.params.omit).toStrictEqual(['givenName', 'gender', 'address', 'address.countryCode']);
    })

    it('Should normalize field names in "include" option', async () => {
      const request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'GET',
        url: '/MyProfile?$include=givenname,GENDER,Address,address.countryCode'
      })) as Singleton.Get.Request;
      expect(request).toBeDefined();
      expect(request.endpoint).toStrictEqual('get');
      expect(request.params.include).toStrictEqual(['givenName', 'gender', 'address', 'address.countryCode']);
    })

    it('Should validate if fields in "pick" option are exist', async () => {
      await expect(() => requestHandler.parseRequest(HttpServerRequest.from({
            method: 'GET',
            url: '/MyProfile?$pick=address.x1'
          }))
      ).rejects.toThrow('UNKNOWN_FIELD');
    })

    it('Should validate if fields in "omit" option are exist', async () => {
      await expect(() => requestHandler.parseRequest(HttpServerRequest.from({
            method: 'GET',
            url: '/MyProfile?$omit=address.x1'
          }))
      ).rejects.toThrow('UNKNOWN_FIELD');
    })

    it('Should validate if fields in "include" option are exist', async () => {
      await expect(() => requestHandler.parseRequest(HttpServerRequest.from({
            method: 'GET',
            url: '/MyProfile?$include=address.x1'
          }))
      ).rejects.toThrow('UNKNOWN_FIELD');
    })

    it('Should allow unknown fields in "pick" option if additionalFields set to "true"', async () => {
      const meta: any = api.getComplexType('Profile');
      meta.additionalFields = true;
      const request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'GET',
        url: '/MyProfile?$pick=notes.add1,notes.add2.add3'
      })) as Singleton.Get.Request;
      expect(request).toBeDefined();
      expect(request.params.pick).toStrictEqual(['notes.add1', 'notes.add2.add3']);
      delete meta.additionalFields;
    })

    it('Should allow unknown fields in "omit" option if additionalFields set to "true"', async () => {
      const meta: any = api.getComplexType('Profile');
      meta.additionalFields = true;
      const request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'GET',
        url: '/MyProfile?$omit=notes.add1,notes.add2.add3'
      })) as Singleton.Get.Request;
      expect(request).toBeDefined();
      expect(request.endpoint).toStrictEqual('get');
      expect(request.params.omit).toStrictEqual(['notes.add1', 'notes.add2.add3']);
      delete meta.additionalFields;
    })

    it('Should allow unknown fields in "include" option if additionalFields set to "true"', async () => {
      const meta: any = api.getComplexType('Profile');
      meta.additionalFields = true;
      const request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'GET',
        url: '/MyProfile?$include=notes.add1,notes.add2.add3'
      })) as Singleton.Get.Request;
      expect(request).toBeDefined();
      expect(request.endpoint).toStrictEqual('get');
      expect(request.params.include).toStrictEqual(['notes.add1', 'notes.add2.add3']);
      delete meta.additionalFields;
    })

  });


  describe('parse "create" operation', function () {

    it('Should parse request', async () => {
      const request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'POST',
        url: '/MyProfile',
        body: {givenName: 'John'},
        headers: {'content-type': 'application/json', 'Accept': 'application/json'}
      })) as Singleton.Create.Request;
      expect(request).toBeDefined();
      const resource = api.getSingleton('MyProfile');
      expect(request.resource).toStrictEqual(resource);
      expect(request.endpoint).toStrictEqual('create');
      expect(request.data).toEqual({givenName: 'John'});
      expect(() => request.switchToHttp()).not.toThrow();
      expect(request.switchToHttp().headers).toBeDefined();
      expect(request.switchToHttp().headers.accept).toStrictEqual('application/json');
    })

    it('Should normalize field names in "pick" option', async () => {
      const request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'POST',
        url: '/MyProfile?$pick=givenname,GENDER,Address,address.countryCode',
        body: {id: 1},
        headers: {'content-type': 'application/json'}
      })) as Singleton.Create.Request;
      expect(request).toBeDefined();
      expect(request.endpoint).toStrictEqual('create');
      expect(request.params.pick).toStrictEqual(['givenName', 'gender', 'address', 'address.countryCode']);
    })

    it('Should normalize field names in "omit" option', async () => {
      const request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'POST',
        url: '/MyProfile?$omit=givenname,GENDER,Address,address.countryCode',
        body: {id: 1},
        headers: {'content-type': 'application/json'}
      })) as Singleton.Create.Request;
      expect(request).toBeDefined();
      expect(request.endpoint).toStrictEqual('create');
      expect(request.params.omit).toStrictEqual(['givenName', 'gender', 'address', 'address.countryCode']);
    })

    it('Should normalize field names in "include" option', async () => {
      const request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'POST',
        url: '/MyProfile?$include=givenname,GENDER,Address,address.countryCode',
        body: {id: 1},
        headers: {'content-type': 'application/json'}
      })) as Singleton.Create.Request;
      expect(request).toBeDefined();
      expect(request.endpoint).toStrictEqual('create');
      expect(request.params.include).toStrictEqual(['givenName', 'gender', 'address', 'address.countryCode']);
    })

    it('Should validate if fields in "pick" option are exist', async () => {
      await expect(() => requestHandler.parseRequest(HttpServerRequest.from({
            method: 'POST',
            url: '/MyProfile?$pick=address.x1',
            body: {id: 1},
            headers: {'content-type': 'application/json'}
          }))
      ).rejects.toThrow('UNKNOWN_FIELD');
    })

    it('Should validate if fields in "omit" option are exist', async () => {
      await expect(() => requestHandler.parseRequest(HttpServerRequest.from({
            method: 'POST',
            url: '/MyProfile?$omit=address.x1',
            body: {id: 1},
            headers: {'content-type': 'application/json'}
          }))
      ).rejects.toThrow('UNKNOWN_FIELD');
    })

    it('Should validate if fields in "include" option are exist', async () => {
      await expect(() => requestHandler.parseRequest(HttpServerRequest.from({
            method: 'POST',
            url: '/MyProfile?$include=address.x1',
            body: {id: 1},
            headers: {'content-type': 'application/json'}
          }))
      ).rejects.toThrow('UNKNOWN_FIELD');
    })

    it('Should allow unknown fields in "pick" option if additionalFields set to "true"', async () => {
      const meta: any = api.getComplexType('Profile');
      meta.additionalFields = true;
      const request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'POST',
        url: '/MyProfile?$pick=notes.add1,notes.add2.add3',
        body: {id: 1},
        headers: {'content-type': 'application/json'}
      })) as Singleton.Create.Request;
      expect(request).toBeDefined();
      expect(request.endpoint).toStrictEqual('create');
      expect(request.params.pick).toStrictEqual(['notes.add1', 'notes.add2.add3']);
      delete meta.additionalFields;
    })

    it('Should allow unknown fields in "omit" option if additionalFields set to "true"', async () => {
      const meta: any = api.getComplexType('Profile');
      meta.additionalFields = true;
      const request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'POST',
        url: '/MyProfile?$omit=notes.add1,notes.add2.add3',
        body: {id: 1},
        headers: {'content-type': 'application/json'}
      })) as Singleton.Create.Request;
      expect(request).toBeDefined();
      expect(request.endpoint).toStrictEqual('create');
      expect(request.params.omit).toStrictEqual(['notes.add1', 'notes.add2.add3']);
      delete meta.additionalFields;
    })

    it('Should allow unknown fields in "include" option if additionalFields set to "true"', async () => {
      const meta: any = api.getComplexType('Profile');
      meta.additionalFields = true;
      const request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'POST',
        url: '/MyProfile?$include=notes.add1,notes.add2.add3',
        body: {id: 1},
        headers: {'content-type': 'application/json'}
      })) as Singleton.Create.Request;
      expect(request).toBeDefined();
      expect(request.endpoint).toStrictEqual('create');
      expect(request.params.include).toStrictEqual(['notes.add1', 'notes.add2.add3']);
      delete meta.additionalFields;
    })

  });


  describe('parse "update" operation', function () {

    it('Should parse request', async () => {
      const request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'PATCH',
        url: '/MyProfile',
        body: {givenName: 'John'},
        headers: {'content-type': 'application/json', 'Accept': 'application/json'}
      })) as Singleton.Update.Request;
      expect(request).toBeDefined();
      const resource = api.getSingleton('MyProfile');
      expect(request.resource).toStrictEqual(resource);
      expect(request.endpoint).toStrictEqual('update');
      expect(request.data).toEqual({givenName: 'John'});
      expect(() => request.switchToHttp()).not.toThrow();
      expect(request.switchToHttp().headers).toBeDefined();
      expect(request.switchToHttp().headers.accept).toStrictEqual('application/json');
    })

    it('Should normalize field names in "pick" option', async () => {
      const request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'PATCH',
        url: '/MyProfile?$pick=givenname,GENDER,Address,address.countryCode',
        headers: {'content-type': 'application/json'},
        body: {id: 1},
      })) as Singleton.Update.Request;
      expect(request).toBeDefined();
      expect(request.endpoint).toStrictEqual('update');
      expect(request.params.pick).toStrictEqual(['givenName', 'gender', 'address', 'address.countryCode']);
    })

    it('Should normalize field names in "omit" option', async () => {
      const request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'PATCH',
        url: '/MyProfile?$omit=givenname,GENDER,Address,address.countryCode',
        headers: {'content-type': 'application/json'},
        body: {id: 1},
      })) as Singleton.Update.Request;
      expect(request).toBeDefined();
      expect(request.endpoint).toStrictEqual('update');
      expect(request.params.omit).toStrictEqual(['givenName', 'gender', 'address', 'address.countryCode']);
    })

    it('Should normalize field names in "include" option', async () => {
      const request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'PATCH',
        url: '/MyProfile?$include=givenname,GENDER,Address,address.countryCode',
        headers: {'content-type': 'application/json'},
        body: {id: 1},
      })) as Singleton.Update.Request;
      expect(request).toBeDefined();
      expect(request.endpoint).toStrictEqual('update');
      expect(request.params.include).toStrictEqual(['givenName', 'gender', 'address', 'address.countryCode']);
    })

    it('Should validate if fields in "pick" option are exist', async () => {
      await expect(() => requestHandler.parseRequest(HttpServerRequest.from({
            method: 'PATCH',
            url: '/MyProfile?$pick=address.x1',
            headers: {'content-type': 'application/json'},
            body: {id: 1},
          }))
      ).rejects.toThrow('UNKNOWN_FIELD');
    })

    it('Should validate if fields in "omit" option are exist', async () => {
      await expect(() => requestHandler.parseRequest(HttpServerRequest.from({
            method: 'PATCH',
            url: '/MyProfile?$omit=address.x1',
            headers: {'content-type': 'application/json'},
            body: {id: 1},
          }))
      ).rejects.toThrow('UNKNOWN_FIELD');
    })

    it('Should validate if fields in "include" option are exist', async () => {
      await expect(() => requestHandler.parseRequest(HttpServerRequest.from({
            method: 'PATCH',
            url: '/MyProfile?$include=address.x1',
            headers: {'content-type': 'application/json'},
            body: {id: 1},
          }))
      ).rejects.toThrow('UNKNOWN_FIELD');
    })

    it('Should allow unknown fields in "pick" option if additionalFields set to "true"', async () => {
      const meta: any = api.getComplexType('Profile');
      meta.additionalFields = true;
      const request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'PATCH',
        url: '/MyProfile?$pick=notes.add1,notes.add2.add3',
        headers: {'content-type': 'application/json'},
        body: {id: 1},
      })) as Singleton.Update.Request;
      expect(request).toBeDefined();
      expect(request.endpoint).toStrictEqual('update');
      expect(request.params.pick).toStrictEqual(['notes.add1', 'notes.add2.add3']);
      delete meta.additionalFields;
    })

    it('Should allow unknown fields in "omit" option if additionalFields set to "true"', async () => {
      const meta: any = api.getComplexType('Profile');
      meta.additionalFields = true;
      const request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'PATCH',
        url: '/MyProfile?$omit=notes.add1,notes.add2.add3',
        headers: {'content-type': 'application/json'},
        body: {id: 1},
      })) as Singleton.Update.Request;
      expect(request).toBeDefined();
      expect(request.endpoint).toStrictEqual('update');
      expect(request.params.omit).toStrictEqual(['notes.add1', 'notes.add2.add3']);
      delete meta.additionalFields;
    })

    it('Should allow unknown fields in "include" option if additionalFields set to "true"', async () => {
      const meta: any = api.getComplexType('Profile');
      meta.additionalFields = true;
      const request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'PATCH',
        url: '/MyProfile?$include=notes.add1,notes.add2.add3',
        headers: {'content-type': 'application/json'},
        body: {id: 1},
      })) as Singleton.Update.Request;
      expect(request).toBeDefined();
      expect(request.endpoint).toStrictEqual('update');
      expect(request.params.include).toStrictEqual(['notes.add1', 'notes.add2.add3']);
      delete meta.additionalFields;
    })

  });

  describe('parse "delete" operation', function () {

    it('Should parse request', async () => {
      const request = await requestHandler.parseRequest(HttpServerRequest.from({
        method: 'DELETE',
        url: '/MyProfile',
        headers: {'Accept': 'application/json'}
      })) as Singleton.Delete.Request;
      expect(request).toBeDefined();
      const resource = api.getSingleton('MyProfile');
      expect(request.resource).toStrictEqual(resource);
      expect(request.endpoint).toStrictEqual('delete');
      expect(() => request.switchToHttp()).not.toThrow();
      expect(request.switchToHttp().headers).toBeDefined();
      expect(request.switchToHttp().headers.accept).toStrictEqual('application/json');
    })

  });

});

