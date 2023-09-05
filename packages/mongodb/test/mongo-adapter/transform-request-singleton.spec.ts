import { ApiDocument } from '@opra/common';
import { Request } from '@opra/core';
import { MongoAdapter } from '@opra/mongodb';
import { createTestApp } from '../../../sqb/test/_support/test-app/index.js';

describe('MongoAdapter.transformRequest (Singleton)', function () {

  let api: ApiDocument;

  beforeAll(async () => {
    api = (await createTestApp()).api;
  });

  describe('Convert "create" request', function () {
    const data = {_id: 1001};

    it('Should prepare', async () => {
      const request = {
        resource: api.getSingleton('MyProfile'),
        endpoint: 'create',
        data
      } as unknown as Request;
      const o = MongoAdapter.transformRequest(request);
      const options = {
        projection: {address: 0}
      }
      expect(o.method).toStrictEqual('insertOne');
      expect(o.data).toStrictEqual(data);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([data, options]);
    });

    it('Should prepare with "pick" option', async () => {
      const request = {
        resource: api.getSingleton('MyProfile'),
        endpoint: 'create',
        data,
        params: {pick: ['givenName']}
      } as unknown as Request;
      const options = {
        projection: {givenName: 1}
      }
      const o = MongoAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('insertOne');
      expect(o.data).toStrictEqual(data);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([data, options]);
    });

    it('Should prepare with "omit" option', async () => {
      const request = {
        resource: api.getSingleton('MyProfile'),
        endpoint: 'create',
        data,
        params: {omit: ['givenName']}
      } as unknown as Request;
      const options = {
        projection: {givenName: 0}
      }
      const o = MongoAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('insertOne');
      expect(o.data).toStrictEqual(data);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([data, options]);
    });

    it('Should prepare with "include" option', async () => {
      const request = {
        resource: api.getSingleton('MyProfile'),
        endpoint: 'create',
        data,
        params: {include: ['address']}
      } as unknown as Request;
      const options = {
        projection: {
          "_id": 1,
          "address": 1,
          "birthDate": 1,
          "deleted": 1,
          "familyName": 1,
          "gender": 1,
          "givenName": 1
        }
      }
      const o = MongoAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('insertOne');
      expect(o.data).toStrictEqual(data);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([data, options]);
    });

  });

  describe('Convert "deleteOne" request', function () {
    it('Should prepare', async () => {
      const request = {
        resource: api.getSingleton('MyProfile'),
        endpoint: 'delete',
      } as unknown as Request;
      const o = MongoAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('deleteOne');
      expect(o.filter).toStrictEqual(undefined);
      expect(o.options).toStrictEqual({});
      expect(o.args).toStrictEqual([undefined, {}]);
    });
  });

  describe('Convert "findOne" request', function () {

    it('Should prepare', async () => {
      const request = {
        resource: api.getSingleton('MyProfile'),
        endpoint: 'get',
      } as unknown as Request;
      const o = MongoAdapter.transformRequest(request);
      const options = {
        projection: {address: 0}
      }
      expect(o.method).toStrictEqual('findOne');
      expect(o.filter).toStrictEqual(undefined);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([undefined, options]);
    });

    it('Should prepare with "pick" option', async () => {
      const request = {
        resource: api.getSingleton('MyProfile'),
        endpoint: 'get',
        params: {pick: ['givenName']}
      } as unknown as Request;
      const options = {
        projection: {givenName: 1}
      }
      const o = MongoAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('findOne');
      expect(o.filter).toStrictEqual(undefined);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([undefined, options]);
    });

    it('Should prepare with "omit" option', async () => {
      const request = {
        resource: api.getSingleton('MyProfile'),
        endpoint: 'get',
        key: 1,
        params: {omit: ['givenName']}
      } as unknown as Request;
      const options = {
        projection: {givenName: 0}
      }
      const o = MongoAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('findOne');
      expect(o.filter).toStrictEqual(undefined);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([undefined, options]);
    });

    it('Should prepare with "include" option', async () => {
      const request = {
        resource: api.getSingleton('MyProfile'),
        endpoint: 'get',
        params: {include: ['address']}
      } as unknown as Request;
      const options = {
        projection: {
          "_id": 1,
          "address": 1,
          "birthDate": 1,
          "deleted": 1,
          "familyName": 1,
          "gender": 1,
          "givenName": 1
        }
      }
      const o = MongoAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('findOne');
      expect(o.filter).toStrictEqual(undefined);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([undefined, options]);
    });

  })

  describe('Convert "updateOne" request', function () {
    const data = {gender: 'M'};
    const update = {$set: data};

    it('Should prepare', async () => {
      const request = {
        resource: api.getSingleton('MyProfile'),
        endpoint: 'update',
        data
      } as unknown as Request;
      const o = MongoAdapter.transformRequest(request);
      const options = {
        projection: {address: 0}
      }
      expect(o.method).toStrictEqual('updateOne');
      expect(o.filter).toStrictEqual({});
      expect(o.data).toStrictEqual(update);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([{}, update, options]);
    });

    it('Should prepare with "pick" option', async () => {
      const request = {
        resource: api.getSingleton('MyProfile'),
        endpoint: 'update',
        data,
        params: {pick: ['givenName']}
      } as unknown as Request;
      const options = {
        projection: {givenName: 1}
      }
      const o = MongoAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('updateOne');
      expect(o.filter).toStrictEqual({});
      expect(o.data).toStrictEqual(update);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([{}, update, options]);
    });

    it('Should prepare with "omit" option', async () => {
      const request = {
        resource: api.getSingleton('MyProfile'),
        endpoint: 'update',
        data,
        params: {omit: ['givenName']}
      } as unknown as Request;
      const options = {
        projection: {givenName: 0}
      }
      const o = MongoAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('updateOne');
      expect(o.filter).toStrictEqual({});
      expect(o.data).toStrictEqual(update);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([{}, update, options]);
    });

    it('Should prepare with "include" option', async () => {
      const request = {
        resource: api.getSingleton('MyProfile'),
        endpoint: 'update',
        data,
        params: {include: ['address']}
      } as unknown as Request;
      const options = {
        projection: {
          "_id": 1,
          "address": 1,
          "birthDate": 1,
          "deleted": 1,
          "familyName": 1,
          "gender": 1,
          "givenName": 1
        }
      }
      const o = MongoAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('updateOne');
      expect(o.filter).toStrictEqual({});
      expect(o.data).toStrictEqual(update);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([{}, update, options]);
    });
  });

});

