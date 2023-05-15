import { ApiDocument } from '@opra/common';
import { Request } from '@opra/core';
import { createTestApi } from '@opra/core/test/_support/test-app';
import { ElasticAdapter } from '@opra/elastic';

describe('ElasticAdapter.transformRequest (Collection)', function () {

  let api: ApiDocument;

  beforeAll(async () => {
    api = await createTestApi();
  });

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
      const o = ElasticAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('search');
      expect(o.params).toStrictEqual({});
      expect(o.options).toStrictEqual({});
      expect(o.args).toStrictEqual([{}, {}]);
    });

    it('Should prepare with "filter" option', async () => {
      const resource = api.getCollection('customers');
      const request = {
        resource: api.getCollection('countries'),
        resourceKind: 'Collection',
        operation: 'findMany',
        crud: 'read',
        many: true,
        args: {filter: resource.normalizeFilter('givenName="John"')}
      } as unknown as Request;
      const options = {};
      const o = ElasticAdapter.transformRequest(request);
      const query = {term: {givenName: 'John'}};
      const params = {query};
      expect(o.method).toStrictEqual('search');
      expect(o.params).toStrictEqual({query});
      expect(o.options).toStrictEqual(options);
      expect(o.args).toStrictEqual([params, options]);
    });

    // it('Should prepare with "pick" option', async () => {
    //   const request = {
    //     resource: api.getCollection('countries'),
    //     resourceKind: 'Collection',
    //     operation: 'findMany',
    //     crud: 'read',
    //     many: true,
    //     args: {pick: ['phoneCode']}
    //   } as unknown as Request;
    //   const options = {
    //     projection: {phoneCode: 1}
    //   }
    //   const o = ElasticAdapter.transformRequest(request);
    //   expect(o.method).toStrictEqual('find');
    //   expect(o.filter).toStrictEqual(undefined);
    //   expect(o.options).toStrictEqual(options);
    //   expect(o.args).toStrictEqual([undefined, options]);
    // });
    //
    // it('Should prepare with "omit" option', async () => {
    //   const request = {
    //     resource: api.getCollection('countries'),
    //     resourceKind: 'Collection',
    //     operation: 'findMany',
    //     crud: 'read',
    //     many: true,
    //     args: {omit: ['phoneCode']}
    //   } as unknown as Request;
    //   const options = {
    //     projection: {phoneCode: 0}
    //   }
    //   const o = ElasticAdapter.transformRequest(request);
    //   expect(o.method).toStrictEqual('find');
    //   expect(o.filter).toStrictEqual(undefined);
    //   expect(o.options).toStrictEqual(options);
    //   expect(o.args).toStrictEqual([undefined, options]);
    // });
    //
    // it('Should prepare with "include" option', async () => {
    //   const request = {
    //     resource: api.getCollection('countries'),
    //     resourceKind: 'Collection',
    //     operation: 'findMany',
    //     crud: 'read',
    //     many: true,
    //     args: {include: ['phoneCode']}
    //   } as unknown as Request;
    //   const options = {
    //     projection: {code: 1, name: 1, phoneCode: 1}
    //   }
    //   const o = ElasticAdapter.transformRequest(request);
    //   expect(o.method).toStrictEqual('find');
    //   expect(o.filter).toStrictEqual(undefined);
    //   expect(o.options).toStrictEqual(options);
    //   expect(o.args).toStrictEqual([undefined, options]);
    // });

  });

});

