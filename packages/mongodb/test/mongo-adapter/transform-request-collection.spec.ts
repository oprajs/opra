import { ApiDocument, parseFilter } from '@opra/common';
import { Request } from '@opra/core';
import { createTestApi } from '@opra/core/test/_support/test-app';
import { MongoAdapter } from '@opra/mongodb';

describe('MongoAdapter.transformRequest (Collection)', function () {

  let api: ApiDocument;

  beforeAll(async () => {
    api = await createTestApi();
  });

  describe('Convert "create" request', function () {
    const data = {_id: 1001};

    it('Should prepare', async () => {
      const request = {
        resource: api.getCollection('countries'),
        resourceKind: 'Collection',
        operation: 'create',
        crud: 'create',
        many: false,
        args: {data}
      } as unknown as Request;
      const o = MongoAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('insertOne');
      expect(o.data).toStrictEqual(data);
      expect(o.options).toStrictEqual({});
      expect(o.args).toStrictEqual([data, {}]);
    });

    it('Should prepare with "pick" option', async () => {
      const request = {
        resource: api.getCollection('countries'),
        resourceKind: 'Collection',
        operation: 'create',
        crud: 'create',
        many: false,
        args: {data, pick: ['phoneCode']}
      } as unknown as Request;
      const options = {
        projection: {phoneCode: 1}
      }
      const o = MongoAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('insertOne');
      expect(o.data).toStrictEqual(data);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([data, options]);
    });

    it('Should prepare with "omit" option', async () => {
      const request = {
        resource: api.getCollection('countries'),
        resourceKind: 'Collection',
        operation: 'create',
        crud: 'create',
        many: false,
        args: {data, omit: ['phoneCode']}
      } as unknown as Request;
      const options = {
        projection: {phoneCode: 0}
      }
      const o = MongoAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('insertOne');
      expect(o.data).toStrictEqual(data);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([data, options]);
    });

    it('Should prepare with "include" option', async () => {
      const request = {
        resource: api.getCollection('countries'),
        resourceKind: 'Collection',
        operation: 'create',
        crud: 'create',
        many: false,
        args: {data, include: ['phoneCode']}
      } as unknown as Request;
      const options = {
        projection: {code: 1, name: 1, phoneCode: 1}
      }
      const o = MongoAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('insertOne');
      expect(o.data).toStrictEqual(data);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([data, options]);
    });

  });

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
      const o = MongoAdapter.transformRequest(request);
      const filter = {code: 1};
      expect(o.method).toStrictEqual('deleteOne');
      expect(o.filter).toStrictEqual(filter);
      expect(o.options).toStrictEqual({});
      expect(o.args).toStrictEqual([filter, {}]);
    });
  });

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
      const o = MongoAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('deleteMany');
      expect(o.filter).toStrictEqual(undefined);
      expect(o.options).toStrictEqual({});
      expect(o.args).toStrictEqual([undefined, {}]);
    });

    it('Should prepare with "filter" option', async () => {
      const request = {
        resource: api.getCollection('countries'),
        resourceKind: 'Collection',
        operation: 'deleteMany',
        crud: 'delete',
        many: true,
        args: {filter: parseFilter('givenName=John')}
      } as unknown as Request;
      const o = MongoAdapter.transformRequest(request);
      const filter = {givenName: 'John'};
      expect(o.method).toStrictEqual('deleteMany');
      expect(o.filter).toStrictEqual(filter);
      expect(o.options).toStrictEqual({});
      expect(o.args).toStrictEqual([filter, {}]);
    })
  });

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
      const o = MongoAdapter.transformRequest(request);
      const filter = {code: 1};
      expect(o.method).toStrictEqual('findOne');
      expect(o.filter).toStrictEqual(filter);
      expect(o.options).toStrictEqual({});
      expect(o.args).toStrictEqual([filter, {}]);
    });

    it('Should prepare with "pick" option', async () => {
      const request = {
        resource: api.getCollection('countries'),
        resourceKind: 'Collection',
        operation: 'get',
        crud: 'read',
        many: false,
        args: {key: 1, pick: ['phoneCode']}
      } as unknown as Request;
      const options = {
        projection: {phoneCode: 1}
      }
      const o = MongoAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('findOne');
      expect(o.filter).toStrictEqual({code: 1});
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([{code: 1}, options]);
    });

    it('Should prepare with "omit" option', async () => {
      const request = {
        resource: api.getCollection('countries'),
        resourceKind: 'Collection',
        operation: 'get',
        crud: 'read',
        many: false,
        args: {key: 1, omit: ['phoneCode']}
      } as unknown as Request;
      const options = {
        projection: {phoneCode: 0}
      }
      const o = MongoAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('findOne');
      expect(o.filter).toStrictEqual({code: 1});
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([{code: 1}, options]);
    });

    it('Should prepare with "include" option', async () => {
      const request = {
        resource: api.getCollection('countries'),
        resourceKind: 'Collection',
        operation: 'get',
        crud: 'read',
        many: false,
        args: {key: 1, include: ['phoneCode']}
      } as unknown as Request;
      const options = {
        projection: {code: 1, name: 1, phoneCode: 1}
      }
      const o = MongoAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('findOne');
      expect(o.filter).toStrictEqual({code: 1});
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([{code: 1}, options]);
    });

  })

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
      const o = MongoAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('find');
      expect(o.filter).toStrictEqual(undefined);
      expect(o.options).toStrictEqual({});
      expect(o.args).toStrictEqual([undefined, {}]);
    });

    it('Should prepare with "filter" option', async () => {
      const request = {
        resource: api.getCollection('countries'),
        resourceKind: 'Collection',
        operation: 'findMany',
        crud: 'read',
        many: true,
        args: {filter: parseFilter('givenName=John')}
      } as unknown as Request;
      const options = {};
      const o = MongoAdapter.transformRequest(request);
      const filter = {givenName: 'John'};
      expect(o.method).toStrictEqual('find');
      expect(o.filter).toStrictEqual(filter);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([filter, options]);
    });

    it('Should prepare with "pick" option', async () => {
      const request = {
        resource: api.getCollection('countries'),
        resourceKind: 'Collection',
        operation: 'findMany',
        crud: 'read',
        many: true,
        args: {pick: ['phoneCode']}
      } as unknown as Request;
      const options = {
        projection: {phoneCode: 1}
      }
      const o = MongoAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('find');
      expect(o.filter).toStrictEqual(undefined);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([undefined, options]);
    });

    it('Should prepare with "omit" option', async () => {
      const request = {
        resource: api.getCollection('countries'),
        resourceKind: 'Collection',
        operation: 'findMany',
        crud: 'read',
        many: true,
        args: {omit: ['phoneCode']}
      } as unknown as Request;
      const options = {
        projection: {phoneCode: 0}
      }
      const o = MongoAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('find');
      expect(o.filter).toStrictEqual(undefined);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([undefined, options]);
    });

    it('Should prepare with "include" option', async () => {
      const request = {
        resource: api.getCollection('countries'),
        resourceKind: 'Collection',
        operation: 'findMany',
        crud: 'read',
        many: true,
        args: {include: ['phoneCode']}
      } as unknown as Request;
      const options = {
        projection: {code: 1, name: 1, phoneCode: 1}
      }
      const o = MongoAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('find');
      expect(o.filter).toStrictEqual(undefined);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([undefined, options]);
    });

  });

  describe('Convert "update" request', function () {
    const data = {gender: 'M'};
    const update = {$set: data};

    it('Should prepare', async () => {
      const request = {
        resource: api.getCollection('countries'),
        resourceKind: 'Collection',
        operation: 'update',
        crud: 'update',
        many: false,
        args: {key: 1, data}
      } as unknown as Request;
      const o = MongoAdapter.transformRequest(request);
      const filter = {code: 1};
      expect(o.method).toStrictEqual('updateOne');
      expect(o.filter).toStrictEqual(filter);
      expect(o.update).toStrictEqual(update);
      expect(o.options).toStrictEqual({});
      expect(o.args).toStrictEqual([filter, update, {}]);
    });

    it('Should prepare with "pick" option', async () => {
      const request = {
        resource: api.getCollection('countries'),
        resourceKind: 'Collection',
        operation: 'update',
        crud: 'update',
        many: false,
        args: {key: 1, data, pick: ['phoneCode']}
      } as unknown as Request;
      const options = {
        projection: {phoneCode: 1}
      }
      const o = MongoAdapter.transformRequest(request);
      const filter = {code: 1};
      expect(o.method).toStrictEqual('updateOne');
      expect(o.filter).toStrictEqual(filter);
      expect(o.update).toStrictEqual(update);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([filter, update, options]);
    });

    it('Should prepare with "omit" option', async () => {
      const request = {
        resource: api.getCollection('countries'),
        resourceKind: 'Collection',
        operation: 'update',
        crud: 'update',
        many: false,
        args: {key: 1, data, omit: ['phoneCode']}
      } as unknown as Request;
      const options = {
        projection: {phoneCode: 0}
      }
      const o = MongoAdapter.transformRequest(request);
      const filter = {code: 1};
      expect(o.method).toStrictEqual('updateOne');
      expect(o.filter).toStrictEqual(filter);
      expect(o.update).toStrictEqual(update);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([filter, update, options]);
    });

    it('Should prepare with "include" option', async () => {
      const request = {
        resource: api.getCollection('countries'),
        resourceKind: 'Collection',
        operation: 'update',
        crud: 'update',
        many: false,
        args: {key: 1, data, include: ['phoneCode']}
      } as unknown as Request;
      const options = {
        projection: {code: 1, name: 1, phoneCode: 1}
      }
      const o = MongoAdapter.transformRequest(request);
      const filter = {code: 1};
      expect(o.method).toStrictEqual('updateOne');
      expect(o.filter).toStrictEqual(filter);
      expect(o.update).toStrictEqual(update);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([filter, update, options]);
    });
  });

  describe('Convert "updateMany" request', function () {
    const data = {gender: 'M'};
    const update = {$set: data};

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
      const o = MongoAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('updateMany');
      expect(o.filter).toStrictEqual(undefined);
      expect(o.update).toStrictEqual(update);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([undefined, update, options]);
    });

    it('Should prepare with "filter" option', async () => {
      const request = {
        resource: api.getCollection('countries'),
        resourceKind: 'Collection',
        operation: 'updateMany',
        crud: 'update',
        many: true,
        args: {data, filter: parseFilter('givenName=John')}
      } as unknown as Request;
      const options = {};
      const o = MongoAdapter.transformRequest(request);
      const filter = {givenName: 'John'};
      expect(o.method).toStrictEqual('updateMany');
      expect(o.filter).toStrictEqual(filter);
      expect(o.update).toStrictEqual(update);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([filter, update, options]);
    })

  });


});

