import { ApiDocument } from '@opra/common';
import { Request } from '@opra/core';
import { createTestApi } from '@opra/core/test/_support/test-app';
import { MongoAdapter } from '@opra/mongodb';

describe('MongoAdapter.transformRequest (Singleton)', function () {

  let api: ApiDocument;

  beforeAll(async () => {
    api = await createTestApi();
  });

  describe('Convert "create" request', function () {
    const data = {_id: 1001};

    it('Should prepare', async () => {
      const request = {
        resource: api.getSingleton('MyProfile'),
        resourceKind: 'Singleton',
        operation: 'create',
        crud: 'create',
        many: false,
        args: {data}
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
        resourceKind: 'Singleton',
        operation: 'create',
        crud: 'create',
        many: false,
        args: {data, pick: ['givenName']}
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
        resourceKind: 'Singleton',
        operation: 'create',
        crud: 'create',
        many: false,
        args: {data, omit: ['givenName']}
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
        resourceKind: 'Singleton',
        operation: 'create',
        crud: 'create',
        many: false,
        args: {data, include: ['address']}
      } as unknown as Request;
      const options = {
        projection: {
          "_id": 1,
          "address": 1,
          "birthDate": 1,
          "createdAt": 1,
          "deleted": 1,
          "familyName": 1,
          "gender": 1,
          "givenName": 1,
          "updatedAt": 1
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
        resourceKind: 'Singleton',
        operation: 'delete',
        crud: 'delete',
        many: false,
        args: {}
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
        resourceKind: 'Singleton',
        operation: 'get',
        crud: 'read',
        many: false,
        args: {}
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
        resourceKind: 'Singleton',
        operation: 'get',
        crud: 'read',
        many: false,
        args: {pick: ['givenName']}
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
        resourceKind: 'Singleton',
        operation: 'get',
        crud: 'read',
        many: false,
        args: {key: 1, omit: ['givenName']}
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
        resourceKind: 'Singleton',
        operation: 'get',
        crud: 'read',
        many: false,
        args: {include: ['address']}
      } as unknown as Request;
      const options = {
        projection: {
          "_id": 1,
          "address": 1,
          "birthDate": 1,
          "createdAt": 1,
          "deleted": 1,
          "familyName": 1,
          "gender": 1,
          "givenName": 1,
          "updatedAt": 1
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
        resourceKind: 'Singleton',
        operation: 'update',
        crud: 'update',
        many: false,
        args: {data}
      } as unknown as Request;
      const o = MongoAdapter.transformRequest(request);
      const options = {
        projection: {address: 0}
      }
      expect(o.method).toStrictEqual('updateOne');
      expect(o.filter).toStrictEqual({});
      expect(o.update).toStrictEqual(update);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([{}, update, options]);
    });

    it('Should prepare with "pick" option', async () => {
      const request = {
        resource: api.getSingleton('MyProfile'),
        resourceKind: 'Singleton',
        operation: 'update',
        crud: 'update',
        many: false,
        args: {data, pick: ['givenName']}
      } as unknown as Request;
      const options = {
        projection: {givenName: 1}
      }
      const o = MongoAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('updateOne');
      expect(o.filter).toStrictEqual({});
      expect(o.update).toStrictEqual(update);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([{}, update, options]);
    });

    it('Should prepare with "omit" option', async () => {
      const request = {
        resource: api.getSingleton('MyProfile'),
        resourceKind: 'Singleton',
        operation: 'update',
        crud: 'update',
        many: false,
        args: {data, omit: ['givenName']}
      } as unknown as Request;
      const options = {
        projection: {givenName: 0}
      }
      const o = MongoAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('updateOne');
      expect(o.filter).toStrictEqual({});
      expect(o.update).toStrictEqual(update);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([{}, update, options]);
    });

    it('Should prepare with "include" option', async () => {
      const request = {
        resource: api.getSingleton('MyProfile'),
        resourceKind: 'Singleton',
        operation: 'update',
        crud: 'update',
        many: false,
        args: {data, include: ['address']}
      } as unknown as Request;
      const options = {
        projection: {
          "_id": 1,
          "address": 1,
          "birthDate": 1,
          "createdAt": 1,
          "deleted": 1,
          "familyName": 1,
          "gender": 1,
          "givenName": 1,
          "updatedAt": 1
        }
      }
      const o = MongoAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('updateOne');
      expect(o.filter).toStrictEqual({});
      expect(o.update).toStrictEqual(update);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([{}, update, options]);
    });
  });

});

