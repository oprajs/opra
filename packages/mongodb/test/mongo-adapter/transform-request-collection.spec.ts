import { ApiDocument } from '@opra/common';
import { Request } from '@opra/core';
import { MongoAdapter } from '@opra/mongodb';
import { createTestApp } from '../../../sqb/test/_support/test-app/index.js';

describe('MongoAdapter.transformRequest (Collection)', function () {

  let api: ApiDocument;

  beforeAll(async () => {
    api = (await createTestApp()).api;
  });

  afterAll(() => global.gc && global.gc());

  describe('Convert "create" request', function () {
    const data = {_id: 1001};

    it('Should prepare', async () => {
      const resource = api.getCollection('customers');
      const request = {
        resource,
        endpoint: resource.getOperation('create'),
        data
      } as unknown as Request;
      const options = {
        projection: {
          address: 0,
          country: 0,
          notes: 0
        }
      };
      const o = MongoAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('insertOne');
      expect(o.data).toStrictEqual(data);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([data, options]);
    });

    it('Should prepare with "pick" option', async () => {
      const resource = api.getCollection('customers');
      const request = {
        resource,
        endpoint: resource.getOperation('create'),
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
      const resource = api.getCollection('customers');
      const request = {
        resource,
        endpoint: resource.getOperation('create'),
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
      const resource = api.getCollection('customers');
      const request = {
        resource,
        endpoint: resource.getOperation('create'),
        data,
        params: {include: ['address']}
      } as unknown as Request;
      const options = {
        projection: {address: 1}
      }
      const o = MongoAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('insertOne');
      expect(o.data).toStrictEqual(data);
      expect(o.options.projection).toMatchObject(options.projection);
      expect(o.args).toStrictEqual([data, o.options]);
    });

  });

  describe('Convert "delete" request', function () {
    it('Should prepare', async () => {
      const resource = api.getCollection('customers');
      const request = {
        resource,
        endpoint: resource.getOperation('delete'),
        key: 1
      } as unknown as Request;
      const o = MongoAdapter.transformRequest(request);
      const filter = {_id: 1};
      expect(o.method).toStrictEqual('deleteOne');
      expect(o.filter).toStrictEqual(filter);
      expect(o.options).toStrictEqual({});
      expect(o.args).toStrictEqual([filter, {}]);
    });
  });

  describe('Convert "deleteMany" request', function () {

    it('Should prepare', async () => {
      const resource = api.getCollection('customers');
      const request = {
        resource,
        endpoint: resource.getOperation('deleteMany'),
        crud: 'delete',
      } as unknown as Request;
      const o = MongoAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('deleteMany');
      expect(o.filter).toStrictEqual(undefined);
      expect(o.options).toStrictEqual({});
      expect(o.args).toStrictEqual([undefined, {}]);
    });

    it('Should prepare with "filter" option', async () => {
      const resource = api.getCollection('customers');
      const request = {
        resource,
        endpoint: resource.getOperation('deleteMany'),
        params: {filter: resource.normalizeFilter('givenName="John"')}
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
      const resource = api.getCollection('customers');
      const request = {
        resource,
        endpoint: resource.getOperation('get'),
        key: 1
      } as unknown as Request;
      const o = MongoAdapter.transformRequest(request);
      const filter = {_id: 1};
      const options = {
        projection: {
          address: 0,
          country: 0,
          notes: 0
        }
      };
      expect(o.method).toStrictEqual('findOne');
      expect(o.filter).toStrictEqual(filter);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([filter, options]);
    });

    it('Should prepare with "pick" option', async () => {
      const resource = api.getCollection('customers');
      const request = {
        resource,
        endpoint: resource.getOperation('get'),
        key: 1,
        params: {pick: ['givenName']}
      } as unknown as Request;
      const options = {
        projection: {givenName: 1}
      }
      const o = MongoAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('findOne');
      expect(o.filter).toStrictEqual({_id: 1});
      expect(o.options).toMatchObject(options);
      expect(o.args).toStrictEqual([{_id: 1}, options]);
    });

    it('Should prepare with "omit" option', async () => {
      const resource = api.getCollection('customers');
      const request = {
        resource,
        endpoint: resource.getOperation('get'),
        key: 1,
        params: {omit: ['givenName']}
      } as unknown as Request;
      const options = {
        projection: {givenName: 0}
      }
      const o = MongoAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('findOne');
      expect(o.filter).toStrictEqual({_id: 1});
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([{_id: 1}, options]);
    });

    it('Should prepare with "include" option', async () => {
      const resource = api.getCollection('customers');
      const request = {
        resource,
        endpoint: resource.getOperation('get'),
        key: 1,
        params: {include: ['address']}
      } as unknown as Request;
      const options = {
        projection: {address: 1}
      }
      const o = MongoAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('findOne');
      expect(o.filter).toStrictEqual({_id: 1});
      expect(o.options).toMatchObject(options);
      expect(o.args).toStrictEqual([{_id: 1}, o.options]);
    });

  })

  describe('Convert "findMany" request', function () {

    it('Should prepare', async () => {
      const resource = api.getCollection('customers');
      const request = {
        resource,
        endpoint: resource.getOperation('findMany'),
      } as unknown as Request;
      const o = MongoAdapter.transformRequest(request);
      const options = {
        projection: {
          address: 0,
          country: 0,
          notes: 0
        }
      };
      expect(o.method).toStrictEqual('find');
      expect(o.filter).toStrictEqual(undefined);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([undefined, options]);
    });

    it('Should prepare with "filter" option', async () => {
      const resource = api.getCollection('customers');
      const request = {
        resource,
        endpoint: resource.getOperation('findMany'),
        params: {filter: resource.normalizeFilter('givenName="John"')}
      } as unknown as Request;
      const o = MongoAdapter.transformRequest(request);
      const filter = {givenName: 'John'};
      const options = {
        projection: {
          address: 0,
          country: 0,
          notes: 0
        }
      };
      expect(o.method).toStrictEqual('find');
      expect(o.filter).toStrictEqual(filter);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([filter, options]);
    });

    it('Should prepare with "pick" option', async () => {
      const resource = api.getCollection('customers');
      const request = {
        resource,
        endpoint: resource.getOperation('findMany'),
        params: {pick: ['givenName']}
      } as unknown as Request;
      const options = {
        projection: {givenName: 1}
      }
      const o = MongoAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('find');
      expect(o.filter).toStrictEqual(undefined);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([undefined, options]);
    });

    it('Should prepare with "omit" option', async () => {
      const resource = api.getCollection('customers');
      const request = {
        resource,
        endpoint: resource.getOperation('findMany'),
        params: {omit: ['givenName']}
      } as unknown as Request;
      const options = {
        projection: {givenName: 0}
      }
      const o = MongoAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('find');
      expect(o.filter).toStrictEqual(undefined);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([undefined, options]);
    });

    it('Should prepare with "include" option', async () => {
      const resource = api.getCollection('customers');
      const request = {
        resource,
        endpoint: resource.getOperation('findMany'),
        params: {include: ['address']}
      } as unknown as Request;
      const options = {
        projection: {address: 1}
      }
      const o = MongoAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('find');
      expect(o.filter).toStrictEqual(undefined);
      expect(o.options).toMatchObject(options);
      expect(o.args).toStrictEqual([undefined, o.options]);
    });

  });

  describe('Convert "update" request', function () {
    const data = {gender: 'M'};
    const update = {$set: data};

    it('Should prepare', async () => {
      const resource = api.getCollection('customers');
      const request = {
        resource,
        endpoint: resource.getOperation('update'),
        key: 1,
        data
      } as unknown as Request;
      const o = MongoAdapter.transformRequest(request);
      const filter = {_id: 1};
      const options = {
        projection: {
          address: 0,
          country: 0,
          notes: 0
        }
      };
      expect(o.method).toStrictEqual('updateOne');
      expect(o.filter).toStrictEqual(filter);
      expect(o.data).toStrictEqual(update);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([filter, update, options]);
    });

    it('Should prepare with "pick" option', async () => {
      const resource = api.getCollection('customers');
      const request = {
        resource,
        endpoint: resource.getOperation('update'),
        key: 1,
        data,
        params: {pick: ['givenName']}
      } as unknown as Request;
      const options = {
        projection: {givenName: 1}
      }
      const o = MongoAdapter.transformRequest(request);
      const filter = {_id: 1};
      expect(o.method).toStrictEqual('updateOne');
      expect(o.filter).toStrictEqual(filter);
      expect(o.data).toStrictEqual(update);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([filter, update, options]);
    });

    it('Should prepare with "omit" option', async () => {
      const resource = api.getCollection('customers');
      const request = {
        resource,
        endpoint: resource.getOperation('update'),
        key: 1, data,
        params: {omit: ['givenName']}
      } as unknown as Request;
      const options = {
        projection: {givenName: 0}
      }
      const o = MongoAdapter.transformRequest(request);
      const filter = {_id: 1};
      expect(o.method).toStrictEqual('updateOne');
      expect(o.filter).toStrictEqual(filter);
      expect(o.data).toStrictEqual(update);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([filter, update, options]);
    });

    it('Should prepare with "include" option', async () => {
      const resource = api.getCollection('customers');
      const request = {
        resource,
        endpoint: resource.getOperation('update'),
        key: 1,
        data,
        params: {include: ['address']}
      } as unknown as Request;
      const options = {
        projection: {address: 1}
      }
      const o = MongoAdapter.transformRequest(request);
      const filter = {_id: 1};
      expect(o.method).toStrictEqual('updateOne');
      expect(o.filter).toStrictEqual(filter);
      expect(o.data).toStrictEqual(update);
      expect(o.options).toMatchObject(options);
      expect(o.args).toStrictEqual([filter, update, o.options]);
    });
  });

  describe('Convert "updateMany" request', function () {
    const data = {gender: 'M'};
    const update = {$set: data};

    it('Should prepare', async () => {
      const resource = api.getCollection('customers');
      const request = {
        resource,
        endpoint: resource.getOperation('updateMany'),
        data
      } as unknown as Request;
      const options = {};
      const o = MongoAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('updateMany');
      expect(o.filter).toStrictEqual(undefined);
      expect(o.data).toStrictEqual(update);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([undefined, update, options]);
    });

    it('Should prepare with "filter" option', async () => {
      const resource = api.getCollection('customers');
      const request = {
        resource,
        endpoint: resource.getOperation('updateMany'),
        data,
        params: {filter: resource.normalizeFilter('givenName="John"')}
      } as unknown as Request;
      const options = {};
      const o = MongoAdapter.transformRequest(request);
      const filter = {givenName: 'John'};
      expect(o.method).toStrictEqual('updateMany');
      expect(o.filter).toStrictEqual(filter);
      expect(o.data).toStrictEqual(update);
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([filter, update, options]);
    })

  });


});

