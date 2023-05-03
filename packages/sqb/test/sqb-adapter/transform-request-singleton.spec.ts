import { ApiDocument } from '@opra/common';
import { Request } from '@opra/core';
import { createTestApi } from '@opra/core/test/_support/test-app';
import { SQBAdapter } from '@opra/sqb';

describe('SQBAdapter.transformRequest (Singleton)', function () {

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
      const o = SQBAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('create');
      expect(o.data).toStrictEqual(data);
      expect(o.options).toStrictEqual({});
      expect(o.args).toStrictEqual([data, {}]);
    });

    it('Should prepare with "pick", "omit" and "include" options', async () => {
      const request = {
        resource: api.getSingleton('MyProfile'),
        resourceKind: 'Singleton',
        operation: 'create',
        crud: 'create',
        many: false,
        args: {
          data,
          pick: ['givenName'],
          omit: ['familyName'],
          include: ['gender']
        }
      } as unknown as Request;
      const options = {
        pick: ['givenName'],
        omit: ['familyName'],
        include: ['gender']
      }
      const o = SQBAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('create');
      expect(o.data).toStrictEqual(data);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([data, options]);
    });

  });

  describe('Convert "delete" request', function () {
    it('Should prepare', async () => {
      const request = {
        resource: api.getSingleton('MyProfile'),
        resourceKind: 'Singleton',
        operation: 'delete',
        crud: 'delete',
        many: false,
        args: {}
      } as unknown as Request;
      const o = SQBAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('deleteMany');
      expect(o.options).toStrictEqual({});
      expect(o.args).toStrictEqual([{}]);
    });
  });

  describe('Convert "get" request', function () {

    it('Should prepare', async () => {
      const request = {
        resource: api.getSingleton('MyProfile'),
        resourceKind: 'Singleton',
        operation: 'get',
        crud: 'read',
        many: false,
        args: {}
      } as unknown as Request;
      const o = SQBAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('findOne');
      expect(o.options).toStrictEqual({});
      expect(o.args).toStrictEqual([{}]);
    });

    it('Should prepare with "pick", "omit" and "include" options', async () => {
      const request = {
        resource: api.getSingleton('MyProfile'),
        resourceKind: 'Singleton',
        operation: 'get',
        crud: 'read',
        many: false,
        args: {
          pick: ['givenName'],
          omit: ['familyName'],
          include: ['gender']
        }
      } as unknown as Request;
      const options = {
        pick: ['givenName'],
        omit: ['familyName'],
        include: ['gender']
      }
      const o = SQBAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('findOne');
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([options]);
    });
  })

  describe('Convert "update" request', function () {
    const data = {gender: 'M'};

    it('Should prepare', async () => {
      const request = {
        resource: api.getSingleton('MyProfile'),
        resourceKind: 'Singleton',
        operation: 'update',
        crud: 'update',
        many: false,
        args: {data}
      } as unknown as Request;
      const o = SQBAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('updateMany');
      expect(o.data).toStrictEqual(data);
      expect(o.options).toStrictEqual({});
      expect(o.args).toStrictEqual([data, {}]);
    });

    it('Should prepare with "pick", "omit" and "include" options', async () => {
      const request = {
        resource: api.getSingleton('MyProfile'),
        resourceKind: 'Singleton',
        operation: 'update',
        crud: 'update',
        many: false,
        args: {
          data,
          pick: ['givenName'],
          omit: ['familyName'],
          include: ['gender']
        }
      } as unknown as Request;
      const options = {
        pick: ['givenName'],
        omit: ['familyName'],
        include: ['gender']
      }
      const o = SQBAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('updateMany');
      expect(o.data).toStrictEqual(data);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([data, options]);
    });

  });

});

