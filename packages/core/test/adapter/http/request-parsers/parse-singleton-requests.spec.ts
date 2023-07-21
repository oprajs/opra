import { ApiDocument, DocumentFactory } from '@opra/common';
import { HttpServerRequest } from '@opra/core';
import { parseRequest } from '@opra/core/adapter/http/request-parsers/parse-request';
import { CustomersResource, MyProfileResource } from '../../../_support/test-app/index.js';

describe('parse Singleton Request', function () {

  let document: ApiDocument;

  beforeAll(async () => {
    document = await DocumentFactory.createDocument({
      version: '1.0',
      info: {
        title: 'TestApi',
        version: 'v1',
      },
      resources: [CustomersResource, MyProfileResource]
    });
  });

  describe('SingletonGetRequest', function () {

    it('Should parse request', async () => {
      const request = await parseRequest(document, HttpServerRequest.create({
        method: 'GET',
        url: '/MyProfile?&$pick=_id&$omit=gender&$include=address',
        headers: {'Accept': 'application/json'}
      }));
      expect(request).toBeDefined();
      const resource = document.getSingleton('MyProfile');
      expect(request.resource).toStrictEqual(resource);
      expect(request.kind).toStrictEqual('SingletonGetRequest');
      expect(request.resourceKind).toStrictEqual('Singleton');
      expect(request.operation).toStrictEqual('get');
      expect(request.crud).toStrictEqual('read');
      expect(request.many).toStrictEqual(false);
      expect(request.args.pick).toStrictEqual(['_id']);
      expect(request.args.omit).toStrictEqual(['gender']);
      expect(request.args.include).toStrictEqual(['address']);
      expect(() => request.switchToHttp()).not.toThrow();
      expect(request.switchToHttp().headers).toBeDefined();
      expect(request.switchToHttp().headers.accept).toStrictEqual('application/json');
    })

    it('Should normalize field names in "pick" option', async () => {
      const request = await parseRequest(document, HttpServerRequest.create({
        method: 'GET',
        url: '/MyProfile?$pick=givenname,GENDER,Address,address.countryCode'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('get');
      expect(request.args.pick).toStrictEqual(['givenName', 'gender', 'address', 'address.countryCode']);
    })

    it('Should normalize field names in "omit" option', async () => {
      const request = await parseRequest(document, HttpServerRequest.create({
        method: 'GET',
        url: '/MyProfile?$omit=givenname,GENDER,Address,address.countryCode'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('get');
      expect(request.args.omit).toStrictEqual(['givenName', 'gender', 'address', 'address.countryCode']);
    })

    it('Should normalize field names in "include" option', async () => {
      const request = await parseRequest(document, HttpServerRequest.create({
        method: 'GET',
        url: '/MyProfile?$include=givenname,GENDER,Address,address.countryCode'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('get');
      expect(request.args.include).toStrictEqual(['givenName', 'gender', 'address', 'address.countryCode']);
    })

    it('Should validate if fields in "pick" option are exist', async () => {
      await expect(() => parseRequest(document, HttpServerRequest.create({
            method: 'GET',
            url: '/MyProfile?$pick=address.x1'
          }))
      ).rejects.toThrow('Invalid field');
    })

    it('Should validate if fields in "omit" option are exist', async () => {
      await expect(() => parseRequest(document, HttpServerRequest.create({
            method: 'GET',
            url: '/MyProfile?$omit=address.x1'
          }))
      ).rejects.toThrow('Invalid field');
    })

    it('Should validate if fields in "include" option are exist', async () => {
      await expect(() => parseRequest(document, HttpServerRequest.create({
            method: 'GET',
            url: '/MyProfile?$include=address.x1'
          }))
      ).rejects.toThrow('Invalid field');
    })

    it('Should allow unknown fields in "pick" option if additionalFields set to "true"', async () => {
      const meta: any = document.getComplexType('Profile');
      meta.additionalFields = true;
      const request = await parseRequest(document, HttpServerRequest.create({
        method: 'GET',
        url: '/MyProfile?$pick=notes.add1,notes.add2.add3'
      }));
      expect(request).toBeDefined();
      expect(request.args.pick).toStrictEqual(['notes.add1', 'notes.add2.add3']);
      delete meta.additionalFields;
    })

    it('Should allow unknown fields in "omit" option if additionalFields set to "true"', async () => {
      const meta: any = document.getComplexType('Profile');
      meta.additionalFields = true;
      const request = await parseRequest(document, HttpServerRequest.create({
        method: 'GET',
        url: '/MyProfile?$omit=notes.add1,notes.add2.add3'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('get');
      expect(request.args.omit).toStrictEqual(['notes.add1', 'notes.add2.add3']);
      delete meta.additionalFields;
    })

    it('Should allow unknown fields in "include" option if additionalFields set to "true"', async () => {
      const meta: any = document.getComplexType('Profile');
      meta.additionalFields = true;
      const request = await parseRequest(document, HttpServerRequest.create({
        method: 'GET',
        url: '/MyProfile?$include=notes.add1,notes.add2.add3'
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('get');
      expect(request.args.include).toStrictEqual(['notes.add1', 'notes.add2.add3']);
      delete meta.additionalFields;
    })

  });


  describe('SingletonCreateRequest', function () {

    it('Should parse request', async () => {
      const request = await parseRequest(document, HttpServerRequest.create({
        method: 'POST',
        url: '/MyProfile',
        body: {name: 'John'},
        headers: {'content-type': 'application/json', 'Accept': 'application/json'}
      }));
      expect(request).toBeDefined();
      const resource = document.getSingleton('MyProfile');
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

    it('Should normalize field names in "pick" option', async () => {
      const request = await parseRequest(document, HttpServerRequest.create({
        method: 'POST',
        url: '/MyProfile?$pick=givenname,GENDER,Address,address.countryCode',
        body: {id: 1},
        headers: {'content-type': 'application/json'}
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('create');
      expect(request.args.pick).toStrictEqual(['givenName', 'gender', 'address', 'address.countryCode']);
    })

    it('Should normalize field names in "omit" option', async () => {
      const request = await parseRequest(document, HttpServerRequest.create({
        method: 'POST',
        url: '/MyProfile?$omit=givenname,GENDER,Address,address.countryCode',
        body: {id: 1},
        headers: {'content-type': 'application/json'}
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('create');
      expect(request.args.omit).toStrictEqual(['givenName', 'gender', 'address', 'address.countryCode']);
    })

    it('Should normalize field names in "include" option', async () => {
      const request = await parseRequest(document, HttpServerRequest.create({
        method: 'POST',
        url: '/MyProfile?$include=givenname,GENDER,Address,address.countryCode',
        body: {id: 1},
        headers: {'content-type': 'application/json'}
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('create');
      expect(request.args.include).toStrictEqual(['givenName', 'gender', 'address', 'address.countryCode']);
    })

    it('Should validate if fields in "pick" option are exist', async () => {
      await expect(() => parseRequest(document, HttpServerRequest.create({
            method: 'POST',
            url: '/MyProfile?$pick=address.x1',
            body: {id: 1},
            headers: {'content-type': 'application/json'}
          }))
      ).rejects.toThrow('Invalid field');
    })

    it('Should validate if fields in "omit" option are exist', async () => {
      await expect(() => parseRequest(document, HttpServerRequest.create({
            method: 'POST',
            url: '/MyProfile?$omit=address.x1',
            body: {id: 1},
            headers: {'content-type': 'application/json'}
          }))
      ).rejects.toThrow('Invalid field');
    })

    it('Should validate if fields in "include" option are exist', async () => {
      await expect(() => parseRequest(document, HttpServerRequest.create({
            method: 'POST',
            url: '/MyProfile?$include=address.x1',
            body: {id: 1},
            headers: {'content-type': 'application/json'}
          }))
      ).rejects.toThrow('Invalid field');
    })

    it('Should allow unknown fields in "pick" option if additionalFields set to "true"', async () => {
      const meta: any = document.getComplexType('Profile');
      meta.additionalFields = true;
      const request = await parseRequest(document, HttpServerRequest.create({
        method: 'POST',
        url: '/MyProfile?$pick=notes.add1,notes.add2.add3',
        body: {id: 1},
        headers: {'content-type': 'application/json'}
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('create');
      expect(request.args.pick).toStrictEqual(['notes.add1', 'notes.add2.add3']);
      delete meta.additionalFields;
    })

    it('Should allow unknown fields in "omit" option if additionalFields set to "true"', async () => {
      const meta: any = document.getComplexType('Profile');
      meta.additionalFields = true;
      const request = await parseRequest(document, HttpServerRequest.create({
        method: 'POST',
        url: '/MyProfile?$omit=notes.add1,notes.add2.add3',
        body: {id: 1},
        headers: {'content-type': 'application/json'}
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('create');
      expect(request.args.omit).toStrictEqual(['notes.add1', 'notes.add2.add3']);
      delete meta.additionalFields;
    })

    it('Should allow unknown fields in "include" option if additionalFields set to "true"', async () => {
      const meta: any = document.getComplexType('Profile');
      meta.additionalFields = true;
      const request = await parseRequest(document, HttpServerRequest.create({
        method: 'POST',
        url: '/MyProfile?$include=notes.add1,notes.add2.add3',
        body: {id: 1},
        headers: {'content-type': 'application/json'}
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('create');
      expect(request.args.include).toStrictEqual(['notes.add1', 'notes.add2.add3']);
      delete meta.additionalFields;
    })

  });

  describe('SingletonUpdateRequest', function () {

    it('Should parse request', async () => {
      const request = await parseRequest(document, HttpServerRequest.create({
        method: 'PATCH',
        url: '/MyProfile',
        body: {name: 'John'},
        headers: {'content-type': 'application/json', 'Accept': 'application/json'}
      }));
      expect(request).toBeDefined();
      const resource = document.getSingleton('MyProfile');
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

    it('Should normalize field names in "pick" option', async () => {
      const request = await parseRequest(document, HttpServerRequest.create({
        method: 'PATCH',
        url: '/MyProfile?$pick=givenname,GENDER,Address,address.countryCode',
        headers: {'content-type': 'application/json'},
        body: {id: 1},
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('update');
      expect(request.args.pick).toStrictEqual(['givenName', 'gender', 'address', 'address.countryCode']);
    })

    it('Should normalize field names in "omit" option', async () => {
      const request = await parseRequest(document, HttpServerRequest.create({
        method: 'PATCH',
        url: '/MyProfile?$omit=givenname,GENDER,Address,address.countryCode',
        headers: {'content-type': 'application/json'},
        body: {id: 1},
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('update');
      expect(request.args.omit).toStrictEqual(['givenName', 'gender', 'address', 'address.countryCode']);
    })

    it('Should normalize field names in "include" option', async () => {
      const request = await parseRequest(document, HttpServerRequest.create({
        method: 'PATCH',
        url: '/MyProfile?$include=givenname,GENDER,Address,address.countryCode',
        headers: {'content-type': 'application/json'},
        body: {id: 1},
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('update');
      expect(request.args.include).toStrictEqual(['givenName', 'gender', 'address', 'address.countryCode']);
    })

    it('Should validate if fields in "pick" option are exist', async () => {
      await expect(() => parseRequest(document, HttpServerRequest.create({
            method: 'PATCH',
            url: '/MyProfile?$pick=address.x1',
            headers: {'content-type': 'application/json'},
            body: {id: 1},
          }))
      ).rejects.toThrow('Invalid field');
    })

    it('Should validate if fields in "omit" option are exist', async () => {
      await expect(() => parseRequest(document, HttpServerRequest.create({
            method: 'PATCH',
            url: '/MyProfile?$omit=address.x1',
            headers: {'content-type': 'application/json'},
            body: {id: 1},
          }))
      ).rejects.toThrow('Invalid field');
    })

    it('Should validate if fields in "include" option are exist', async () => {
      await expect(() => parseRequest(document, HttpServerRequest.create({
            method: 'PATCH',
            url: '/MyProfile?$include=address.x1',
            headers: {'content-type': 'application/json'},
            body: {id: 1},
          }))
      ).rejects.toThrow('Invalid field');
    })

    it('Should allow unknown fields in "pick" option if additionalFields set to "true"', async () => {
      const meta: any = document.getComplexType('Profile');
      meta.additionalFields = true;
      const request = await parseRequest(document, HttpServerRequest.create({
        method: 'PATCH',
        url: '/MyProfile?$pick=notes.add1,notes.add2.add3',
        headers: {'content-type': 'application/json'},
        body: {id: 1},
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('update');
      expect(request.args.pick).toStrictEqual(['notes.add1', 'notes.add2.add3']);
      delete meta.additionalFields;
    })

    it('Should allow unknown fields in "omit" option if additionalFields set to "true"', async () => {
      const meta: any = document.getComplexType('Profile');
      meta.additionalFields = true;
      const request = await parseRequest(document, HttpServerRequest.create({
        method: 'PATCH',
        url: '/MyProfile?$omit=notes.add1,notes.add2.add3',
        headers: {'content-type': 'application/json'},
        body: {id: 1},
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('update');
      expect(request.args.omit).toStrictEqual(['notes.add1', 'notes.add2.add3']);
      delete meta.additionalFields;
    })

    it('Should allow unknown fields in "include" option if additionalFields set to "true"', async () => {
      const meta: any = document.getComplexType('Profile');
      meta.additionalFields = true;
      const request = await parseRequest(document, HttpServerRequest.create({
        method: 'PATCH',
        url: '/MyProfile?$include=notes.add1,notes.add2.add3',
        headers: {'content-type': 'application/json'},
        body: {id: 1},
      }));
      expect(request).toBeDefined();
      expect(request.operation).toStrictEqual('update');
      expect(request.args.include).toStrictEqual(['notes.add1', 'notes.add2.add3']);
      delete meta.additionalFields;
    })

  });

  describe('SingletonDeleteRequest', function () {

    it('Should parse request', async () => {
      const request = await parseRequest(document, HttpServerRequest.create({
        method: 'DELETE',
        url: '/MyProfile',
        headers: {'Accept': 'application/json'}
      }));
      expect(request).toBeDefined();
      const resource = document.getSingleton('MyProfile');
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

