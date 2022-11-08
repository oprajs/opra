import {
  CollectionCreateQuery,
  CollectionDeleteManyQuery,
  CollectionDeleteQuery,
  CollectionGetQuery, CollectionSearchQuery,
  CollectionUpdateManyQuery,
  CollectionUpdateQuery,
  OpraDocument
} from '@opra/schema';
import { OpraURL } from '@opra/url';
import { OpraHttpAdapter } from '../../src/adapter/http-adapter.js';
import { CustomerNotesResource } from '../_support/test-app/resource/customer-notes.resource.js';
import { CustomersResource } from '../_support/test-app/resource/customers.resource.js';

describe('OpraHttpAdapter', function () {

  let service: OpraDocument;

  beforeAll(async () => {
    service = await OpraDocument.create({
      info: {
        title: 'TestApi',
        version: 'v1',
      },
      types: [],
      resources: [new CustomersResource(), new CustomerNotesResource()]
    });
  });

  describe('buildQuery(CollectionResource)', function () {

    it('Should generate "CollectionGetQuery" query', async () => {
      const adapter = new OpraHttpAdapter(service);
      const url = new OpraURL('/Customers@1?&$pick=id&$omit=gender&$include=address');
      const query = adapter.buildQuery(url, 'GET') as CollectionGetQuery;
      expect(query).toBeDefined();
      const resource = service.getCollectionResource('Customers');
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.method).toStrictEqual('get');
      expect(query.keyValue).toStrictEqual(1);
      expect(query.pick).toStrictEqual(['id']);
      expect(query.omit).toStrictEqual(['gender']);
      expect(query.include).toStrictEqual(['address']);
    })

    it('Should generate "CollectionCreateQuery" query', async () => {
      const adapter = new OpraHttpAdapter(service);
      const url = new OpraURL('/Customers');
      const query = adapter.buildQuery(url, 'POST', {id: 1}) as CollectionCreateQuery;
      expect(query).toBeDefined();
      const resource = service.getCollectionResource('Customers');
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.method).toStrictEqual('create');
      expect(query.data).toStrictEqual({id: 1});
    })

    it('Should generate "CollectionUpdateQuery" query', async () => {
      const adapter = new OpraHttpAdapter(service);
      const url = new OpraURL('/Customers@1');
      const query = adapter.buildQuery(url, 'PATCH', {id: 1}) as CollectionUpdateQuery;
      expect(query).toBeDefined();
      const resource = service.getCollectionResource('Customers');
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.method).toStrictEqual('update');
      expect(query.keyValue).toStrictEqual(1);
      expect(query.data).toStrictEqual({id: 1});
    })

    it('Should generate "CollectionUpdateManyQuery" query', async () => {
      const adapter = new OpraHttpAdapter(service);
      const url = new OpraURL('/Customers?$filter=id<10');
      const query = adapter.buildQuery(url, 'PATCH', {id: 1}) as CollectionUpdateManyQuery;
      expect(query).toBeDefined();
      const resource = service.getCollectionResource('Customers');
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.method).toStrictEqual('updateMany');
      expect(query.filter).toBeDefined();
      expect(query.data).toStrictEqual({id: 1});
    })

    it('Should generate "CollectionDeleteQuery" query', async () => {
      const adapter = new OpraHttpAdapter(service);
      const url = new OpraURL('/Customers@1');
      const query = adapter.buildQuery(url, 'DELETE') as CollectionDeleteQuery;
      expect(query).toBeDefined();
      const resource = service.getCollectionResource('Customers');
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.method).toStrictEqual('delete');
      expect(query.keyValue).toStrictEqual(1);
    })

    it('Should generate "CollectionDeleteManyQuery" query', async () => {
      const adapter = new OpraHttpAdapter(service);
      const url = new OpraURL('/Customers?$filter=id<10');
      const query = adapter.buildQuery(url, 'DELETE') as CollectionDeleteManyQuery;
      expect(query).toBeDefined();
      const resource = service.getCollectionResource('Customers');
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.method).toStrictEqual('deleteMany');
      expect(query.filter).toBeDefined()
    })

    it('Should generate "CollectionSearchQuery" query', async () => {
      const adapter = new OpraHttpAdapter(service);
      const url = new OpraURL('/Customers?$limit=1&$skip=1&$count=n&$distinct=t&$sort=id' +
          '&$pick=id&$omit=gender&$include=address');
      const query = adapter.buildQuery(url, 'GET') as CollectionSearchQuery;
      expect(query).toBeDefined();
      expect(query.kind).toStrictEqual('SearchCollectionQuery');
      expect(query.resource.name).toStrictEqual('Customers');
      expect(query.method).toStrictEqual('search');
      expect(query.limit).toStrictEqual(1);
      expect(query.skip).toStrictEqual(1);
      expect(query.count).toStrictEqual(false);
      expect(query.distinct).toStrictEqual(true);
      expect(query.sort).toStrictEqual(['id']);
      expect(query.pick).toStrictEqual(['id']);
      expect(query.omit).toStrictEqual(['gender']);
      expect(query.include).toStrictEqual(['address']);
    })
  });

});
