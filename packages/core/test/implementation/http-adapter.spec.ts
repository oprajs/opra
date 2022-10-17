import {
  OpraApi, OpraCreateInstanceQuery, OpraDeleteCollectionQuery, OpraDeleteInstanceQuery,
  OpraGetInstanceQuery,
  OpraSearchCollectionQuery,
  OpraUpdateCollectionQuery,
  OpraUpdateInstanceQuery
} from '@opra/schema';
import { OpraURL } from '@opra/url';
import { OpraHttpAdapter } from '../../src/implementation/http-adapter.js';
import { CustomerNotesResource } from '../_support/test-app/resource/customer-notes.resource.js';
import { CustomersResource } from '../_support/test-app/resource/customers.resource.js';

describe('OpraHttpAdapter', function () {

  let service: OpraApi;

  beforeAll(async () => {
    service = await OpraApi.create({
      info: {
        title: 'TestApi',
        version: 'v1',
      },
      types: [],
      resources: [new CustomersResource(), new CustomerNotesResource()]
    });
  });

  describe('buildQuery(EntityResource)', function () {

    it('Should generate "GetInstanceQuery" query', async () => {
      const adapter = new OpraHttpAdapter(service);
      const url = new OpraURL('/Customers@1?&$pick=id&$omit=gender&$include=address');
      const query = adapter.buildQuery(url, 'GET') as OpraGetInstanceQuery;
      expect(query).toBeDefined();
      const resource = service.getEntityResource('Customers');
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.method).toStrictEqual('get');
      expect(query.keyValue).toStrictEqual(1);
      expect(query.pick).toStrictEqual(['id']);
      expect(query.omit).toStrictEqual(['gender']);
      expect(query.include).toStrictEqual(['address']);
    })

    it('Should generate "CreateInstanceQuery" query', async () => {
      const adapter = new OpraHttpAdapter(service);
      const url = new OpraURL('/Customers');
      const query = adapter.buildQuery(url, 'POST', {id: 1}) as OpraCreateInstanceQuery;
      expect(query).toBeDefined();
      const resource = service.getEntityResource('Customers');
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.method).toStrictEqual('create');
      expect(query.data).toStrictEqual({id: 1});
    })

    it('Should generate "UpdateInstanceQuery" query', async () => {
      const adapter = new OpraHttpAdapter(service);
      const url = new OpraURL('/Customers@1');
      const query = adapter.buildQuery(url, 'PATCH', {id: 1}) as OpraUpdateInstanceQuery;
      expect(query).toBeDefined();
      const resource = service.getEntityResource('Customers');
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.method).toStrictEqual('update');
      expect(query.keyValue).toStrictEqual(1);
      expect(query.data).toStrictEqual({id: 1});
    })

    it('Should generate "UpdateCollectionQuery" query', async () => {
      const adapter = new OpraHttpAdapter(service);
      const url = new OpraURL('/Customers?$filter=id<10');
      const query = adapter.buildQuery(url, 'PATCH', {id: 1}) as OpraUpdateCollectionQuery;
      expect(query).toBeDefined();
      const resource = service.getEntityResource('Customers');
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.method).toStrictEqual('updateMany');
      expect(query.filter).toBeDefined();
      expect(query.data).toStrictEqual({id: 1});
    })

    it('Should generate "DeleteInstanceQuery" query', async () => {
      const adapter = new OpraHttpAdapter(service);
      const url = new OpraURL('/Customers@1');
      const query = adapter.buildQuery(url, 'DELETE') as OpraDeleteInstanceQuery;
      expect(query).toBeDefined();
      const resource = service.getEntityResource('Customers');
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.method).toStrictEqual('delete');
      expect(query.keyValue).toStrictEqual(1);
    })

    it('Should generate "DeleteCollectionQuery" query', async () => {
      const adapter = new OpraHttpAdapter(service);
      const url = new OpraURL('/Customers?$filter=id<10');
      const query = adapter.buildQuery(url, 'DELETE') as OpraDeleteCollectionQuery;
      expect(query).toBeDefined();
      const resource = service.getEntityResource('Customers');
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.method).toStrictEqual('deleteMany');
      expect(query.filter).toBeDefined()
    })

    it('Should generate "SearchCollectionQuery" query', async () => {
      const adapter = new OpraHttpAdapter(service);
      const url = new OpraURL('/Customers?$limit=1&$skip=1&$count=n&$distinct=t&$sort=id' +
          '&$pick=id&$omit=gender&$include=address');
      const query = adapter.buildQuery(url, 'GET') as OpraSearchCollectionQuery;
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
