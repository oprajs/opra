/* eslint-disable import/no-duplicates */
import '@opra/sqb';
import { ApiDocument, parseFilter } from '@opra/common';
import { Request } from '@opra/core';
import { createTestApi } from '@opra/core/test/_support/test-app';
import { SQBAdapter } from '@opra/sqb';
import { Eq, Field } from '@sqb/builder';

describe('SQBAdapter.transformRequest (Collection)', function () {

  let api: ApiDocument;

  beforeAll(async () => {
    api = await createTestApi();
  });

  /*
   *
   */
  describe('Convert "create" request', function () {
    const data = {_id: 1001};

    it('Should prepare', async () => {
      const request = {
        resource: api.getCollection('countries'),
        resourceKind: 'Collection',
        operation: 'create',
        crud: 'create',
        many: false,
        args: {
          data,
        }
      } as unknown as Request;
      const options = {};
      const o = SQBAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('create');
      expect(o.data).toStrictEqual(data);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([data, options]);
    });

    it('Should prepare with "pick", "omit" and "include" options', async () => {
      const request = {
        resource: api.getCollection('countries'),
        resourceKind: 'Collection',
        operation: 'create',
        crud: 'create',
        many: false,
        args: {
          data,
          pick: ['phoneCode'],
          omit: ['code'],
          include: ['name']
        }
      } as unknown as Request;
      const options = {
        pick: ['phoneCode'],
        omit: ['code'],
        include: ['name']
      }
      const o = SQBAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('create');
      expect(o.data).toStrictEqual(data);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([data, options]);
    });
  });

  /*
   *
   */
  describe('Convert "delete" request', function () {
    it('Should prepare', async () => {
      const request = {
        resource: api.getCollection('countries'),
        resourceKind: 'Collection',
        operation: 'delete',
        crud: 'delete',
        many: false,
        args: {key: 1}
      } as unknown as Request;
      const o = SQBAdapter.transformRequest(request);
      const options = {};
      expect(o.method).toStrictEqual('delete');
      expect(o.key).toStrictEqual(1);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([1, options]);
    });
  });

  /*
   *
   */
  describe('Convert "deleteMany" request', function () {

    it('Should prepare', async () => {
      const request = {
        resource: api.getCollection('countries'),
        resourceKind: 'Collection',
        operation: 'deleteMany',
        crud: 'delete',
        many: true,
        args: {}
      } as unknown as Request;
      const o = SQBAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('deleteMany');
      expect(o.options).toStrictEqual({});
      expect(o.args).toStrictEqual([{}]);
    });

    it('Should prepare with "filter" option', async () => {
      const request = {
        resource: api.getCollection('customers'),
        resourceKind: 'Collection',
        operation: 'deleteMany',
        crud: 'delete',
        many: true,
        args: {filter: parseFilter('givenName="John"')}
      } as unknown as Request;
      const o = SQBAdapter.transformRequest(request);
      const options = {
        filter: Eq(Field('givenName'), 'John')
      }
      expect(o.method).toStrictEqual('deleteMany');
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([options]);
    })
  });

  /*
   *
   */
  describe('Convert "get" request', function () {

    it('Should prepare', async () => {
      const request = {
        resource: api.getCollection('countries'),
        resourceKind: 'Collection',
        operation: 'get',
        crud: 'read',
        many: false,
        args: {key: 1}
      } as unknown as Request;
      const o = SQBAdapter.transformRequest(request);
      const options = {}
      expect(o.method).toStrictEqual('find');
      expect(o.key).toStrictEqual(1);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([1, options]);
    });

    it('Should prepare with "pick", "omit" and "include" options', async () => {
      const request = {
        resource: api.getCollection('countries'),
        resourceKind: 'Collection',
        operation: 'get',
        crud: 'read',
        many: false,
        args: {
          key: 1,
          pick: ['phoneCode'],
          omit: ['code'],
          include: ['name']
        }
      } as unknown as Request;
      const options = {
        pick: ['phoneCode'],
        omit: ['code'],
        include: ['name']
      }
      const o = SQBAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('find');
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([1, options]);
    });

  })

  /*
   *
   */
  describe('Convert "findMany" request', function () {

    it('Should prepare', async () => {
      const request = {
        resource: api.getCollection('countries'),
        resourceKind: 'Collection',
        operation: 'findMany',
        crud: 'read',
        many: true,
        args: {}
      } as unknown as Request;
      const o = SQBAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('findMany');
      expect(o.options).toStrictEqual({});
      expect(o.args).toStrictEqual([{}]);
    });

    it('Should prepare with "filter" option', async () => {
      const request = {
        resource: api.getCollection('customers'),
        resourceKind: 'Collection',
        operation: 'findMany',
        crud: 'read',
        many: true,
        args: {filter: parseFilter('givenName="John"')}
      } as unknown as Request;
      const o = SQBAdapter.transformRequest(request);
      const options = {
        filter: Eq(Field('givenName'), 'John')
      }
      expect(o.method).toStrictEqual('findMany');
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([options]);
    });

    it('Should prepare with "pick", "omit" and "include" options', async () => {
      const request = {
        resource: api.getCollection('countries'),
        resourceKind: 'Collection',
        operation: 'findMany',
        crud: 'read',
        many: true,
        args: {
          pick: ['phoneCode'],
          omit: ['code'],
          include: ['name']
        }
      } as unknown as Request;
      const options = {
        pick: ['phoneCode'],
        omit: ['code'],
        include: ['name']
      }
      const o = SQBAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('findMany');
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([options]);
    });
  });

  /*
   *
   */
  describe('Convert "update" request', function () {
    const data = {gender: 'M'};

    it('Should prepare', async () => {
      const request = {
        resource: api.getCollection('countries'),
        resourceKind: 'Collection',
        operation: 'update',
        crud: 'update',
        many: false,
        args: {key: 1, data}
      } as unknown as Request;
      const o = SQBAdapter.transformRequest(request);
      const options = {}
      expect(o.method).toStrictEqual('update');
      expect(o.key).toStrictEqual(1);
      expect(o.data).toStrictEqual(data);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([1, data, options]);
    });

    it('Should prepare with "pick", "omit" and "include" options', async () => {
      const request = {
        resource: api.getCollection('countries'),
        resourceKind: 'Collection',
        operation: 'update',
        crud: 'update',
        many: false,
        args: {
          key: 1,
          data,
          pick: ['phoneCode'],
          omit: ['code'],
          include: ['name']
        }
      } as unknown as Request;
      const options = {
        pick: ['phoneCode'],
        omit: ['code'],
        include: ['name']
      }
      const o = SQBAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('update');
      expect(o.key).toStrictEqual(1);
      expect(o.data).toStrictEqual(data);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([1, data, options]);
    });
  });

  /*
   *
   */
  describe('Convert "updateMany" request', function () {
    const data = {gender: 'M'};

    it('Should prepare', async () => {
      const request = {
        resource: api.getCollection('countries'),
        resourceKind: 'Collection',
        operation: 'updateMany',
        crud: 'update',
        many: true,
        args: {data}
      } as unknown as Request;
      const options = {};
      const o = SQBAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('updateMany');
      expect(o.data).toStrictEqual(data);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([data, options]);
    });

    it('Should prepare with "filter" option', async () => {
      const request = {
        resource: api.getCollection('customers'),
        resourceKind: 'Collection',
        operation: 'updateMany',
        crud: 'update',
        many: true,
        args: {data, filter: parseFilter('givenName="John"')}
      } as unknown as Request;
      const o = SQBAdapter.transformRequest(request);
      const options = {
        filter: Eq(Field('givenName'), 'John')
      }
      expect(o.method).toStrictEqual('updateMany');
      expect(o.data).toStrictEqual(data);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([data, options]);
    })

  });

});

