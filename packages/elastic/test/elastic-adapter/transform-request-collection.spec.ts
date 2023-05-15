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

    it('Should prepare with "pick" option', async () => {
      const request = {
        resource: api.getCollection('customers'),
        resourceKind: 'Collection',
        operation: 'findMany',
        crud: 'read',
        many: true,
        args: {pick: ['gender', 'address']}
      } as unknown as Request;
      const params = {
        _source: {includes: ['gender', 'address.*']}
      }
      const o = ElasticAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('search');
      expect(o.params).toStrictEqual(params);
      expect(o.options).toStrictEqual({});
      expect(o.args).toStrictEqual([params, {}]);
    });

    it('Should prepare with "omit" option', async () => {
      const request = {
        resource: api.getCollection('customers'),
        resourceKind: 'Collection',
        operation: 'findMany',
        crud: 'read',
        many: true,
        args: {omit: ['gender', 'address']}
      } as unknown as Request;
      const params = {
        _source: {excludes: ['gender', 'address.*']}
      }
      const o = ElasticAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('search');
      expect(o.params).toStrictEqual(params);
      expect(o.options).toStrictEqual({});
      expect(o.args).toStrictEqual([params, {}]);
    });

    it('Should prepare with "include" option', async () => {
      const request = {
        resource: api.getCollection('customers'),
        resourceKind: 'Collection',
        operation: 'findMany',
        crud: 'read',
        many: true,
        args: {include: ['address']}
      } as unknown as Request;
      const o = ElasticAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('search');
      expect(o.params).toBeDefined();
      expect(o.params).toBeDefined();
      expect(o.params._source).toBeDefined();
      expect(o.params._source.includes).toBeDefined();
      expect(o.params._source.includes).toContain('givenName');
      expect(o.params._source.includes).toContain('address.*');
      expect(o.params._source.includes).not.toContain('notes.*');
      expect(o.options).toStrictEqual({});
    });

    it('Should prepare with "sort" option', async () => {
      const request = {
        resource: api.getCollection('customers'),
        resourceKind: 'Collection',
        operation: 'findMany',
        crud: 'read',
        many: true,
        args: {sort: ['givenName']}
      } as unknown as Request;
      const params = {
        sort: ['givenName']
      }
      const o = ElasticAdapter.transformRequest(request);
      expect(o.method).toStrictEqual('search');
      expect(o.params).toStrictEqual(params);
      expect(o.options).toStrictEqual({});
      expect(o.args).toStrictEqual([params, {}]);
    });

  });

});

