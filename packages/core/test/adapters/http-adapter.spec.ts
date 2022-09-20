import 'reflect-metadata';
import { OpraURL } from '@opra/url';
import { OpraHttpAdapter } from '../../src/implementation/adapter/http-adapter.js';
import {
  CreateQuery, DeleteManyQuery,
  DeleteQuery,
  GetQuery,
  OpraService,
  SearchQuery, UpdateManyQuery,
  UpdateQuery
} from '../../src/index.js';
import { CustomerAddressesesResource } from '../_support/test-app/api/customer-addresseses.resource.js';
import { CustomersResource } from '../_support/test-app/api/customers.resource.js';
import { Address } from '../_support/test-app/dto/address.dto.js';
import { Customer } from '../_support/test-app/dto/customer.dto.js';


describe('OpraHttpAdapter', function () {

  let service: OpraService;

  beforeAll(async () => {
    service = await OpraService.create({
      info: {
        title: 'TestApi',
        version: 'v1',
      },
      types: [Customer, Address],
      resources: [new CustomersResource(), new CustomerAddressesesResource()]
    });
  });

  describe('buildQuery()', function () {

    describe('EntityResource', function () {

      it('Should generate "search" query', async () => {
        const adapter = new OpraHttpAdapter(service);
        const url = new OpraURL('/Customers?$limit=1&$skip=2&$count=false&$distinct=true&$filter=id=1' +
            '&$pick=id&$omit=gender&$include=address&$sort=id');
        const query = adapter.buildQuery(url, 'GET') as SearchQuery;
        expect(query).toBeDefined();
        const resource = service.getEntityResource('Customers');
        expect(query).toBeDefined();
        expect(query.resource).toStrictEqual(resource);
        expect(query.queryType).toStrictEqual('search');
        expect(query.limit).toStrictEqual(1);
        expect(query.skip).toStrictEqual(2);
        expect(query.count).toStrictEqual(false);
        expect(query.distinct).toStrictEqual(true);
        expect(query.filter).toBeDefined();
        expect(query.pick).toStrictEqual(['id']);
        expect(query.omit).toStrictEqual(['gender']);
        expect(query.include).toStrictEqual(['address']);
        expect(query.sort).toStrictEqual(['id']);
      })

      it('Should generate "get" query', async () => {
        const adapter = new OpraHttpAdapter(service);
        const url = new OpraURL('/Customers@1?&$pick=id&$omit=gender&$include=address');
        const query = adapter.buildQuery(url, 'GET') as GetQuery;
        expect(query).toBeDefined();
        const resource = service.getEntityResource('Customers');
        expect(query).toBeDefined();
        expect(query.resource).toStrictEqual(resource);
        expect(query.queryType).toStrictEqual('get');
        expect(query.keyValue).toStrictEqual('1');
        expect(query.pick).toStrictEqual(['id']);
        expect(query.omit).toStrictEqual(['gender']);
        expect(query.include).toStrictEqual(['address']);
      })

      it('Should generate "create" query', async () => {
        const adapter = new OpraHttpAdapter(service);
        const url = new OpraURL('/Customers');
        const query = adapter.buildQuery(url, 'POST', {id: 1}) as CreateQuery;
        expect(query).toBeDefined();
        const resource = service.getEntityResource('Customers');
        expect(query).toBeDefined();
        expect(query.resource).toStrictEqual(resource);
        expect(query.queryType).toStrictEqual('create');
        expect(query.data).toStrictEqual({id: 1});
      })

      it('Should generate "update" query', async () => {
        const adapter = new OpraHttpAdapter(service);
        const url = new OpraURL('/Customers@1');
        const query = adapter.buildQuery(url, 'PATCH', {id: 1}) as UpdateQuery;
        expect(query).toBeDefined();
        const resource = service.getEntityResource('Customers');
        expect(query).toBeDefined();
        expect(query.resource).toStrictEqual(resource);
        expect(query.queryType).toStrictEqual('update');
        expect(query.keyValue).toStrictEqual('1');
        expect(query.data).toStrictEqual({id: 1});
      })

      it('Should generate "updateMany" query', async () => {
        const adapter = new OpraHttpAdapter(service);
        const url = new OpraURL('/Customers?$filter=id<10');
        const query = adapter.buildQuery(url, 'PATCH', {id: 1}) as UpdateManyQuery;
        expect(query).toBeDefined();
        const resource = service.getEntityResource('Customers');
        expect(query).toBeDefined();
        expect(query.resource).toStrictEqual(resource);
        expect(query.queryType).toStrictEqual('updateMany');
        expect(query.filter).toBeDefined();
        expect(query.data).toStrictEqual({id: 1});
      })

      it('Should generate "delete" query', async () => {
        const adapter = new OpraHttpAdapter(service);
        const url = new OpraURL('/Customers@1');
        const query = adapter.buildQuery(url, 'DELETE') as DeleteQuery;
        expect(query).toBeDefined();
        const resource = service.getEntityResource('Customers');
        expect(query).toBeDefined();
        expect(query.resource).toStrictEqual(resource);
        expect(query.queryType).toStrictEqual('delete');
        expect(query.keyValue).toStrictEqual('1');
      })

      it('Should generate "deleteMany" query', async () => {
        const adapter = new OpraHttpAdapter(service);
        const url = new OpraURL('/Customers?$filter=id<10');
        const query = adapter.buildQuery(url, 'DELETE') as DeleteManyQuery;
        expect(query).toBeDefined();
        const resource = service.getEntityResource('Customers');
        expect(query).toBeDefined();
        expect(query.resource).toStrictEqual(resource);
        expect(query.queryType).toStrictEqual('deleteMany');
        expect(query.filter).toBeDefined()
      })

    });

  })

});
