import 'reflect-metadata';
import {
  CreateQuery, DeleteManyQuery,
  DeleteQuery,
  ExecutionQuery,
  GetQuery,
  OpraService,
  SearchQuery, UpdateManyQuery,
  UpdateQuery
} from '../../src/index.js';
import { CustomerAddressesesResource } from '../_support/test-app/api/customer-addresseses.resource.js';
import { CustomersResource } from '../_support/test-app/api/customers.resource.js';
import { Address } from '../_support/test-app/dto/address.dto.js';
import { Customer } from '../_support/test-app/dto/customer.dto.js';

describe('ExecutionQuery', function () {
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

  describe('forSearch()', function () {
    it('Should create SearchQuery', async () => {
      const resource = service.getEntityResource('Customers');
      const query = ExecutionQuery.forSearch(resource, {}) as SearchQuery;
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.queryType).toStrictEqual('search');
      expect(query.operationType).toStrictEqual('read');
      expect(query.scope).toStrictEqual('collection');
    })

    it('Should set "limit" option', async () => {
      const resource = service.getEntityResource('Customers');
      const query = ExecutionQuery.forSearch(resource, {limit: 5}) as SearchQuery;
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.queryType).toStrictEqual('search');
      expect(query.operationType).toStrictEqual('read');
      expect(query.scope).toStrictEqual('collection');
      expect(query.limit).toStrictEqual(5);
    })

    it('Should set "skip" option', async () => {
      const resource = service.getEntityResource('Customers');
      const query = ExecutionQuery.forSearch(resource, {skip: 5}) as SearchQuery;
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.queryType).toStrictEqual('search');
      expect(query.operationType).toStrictEqual('read');
      expect(query.scope).toStrictEqual('collection');
      expect(query.skip).toStrictEqual(5);
    })

    it('Should set "total" option', async () => {
      const resource = service.getEntityResource('Customers');
      const query = ExecutionQuery.forSearch(resource, {count: true}) as SearchQuery;
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.queryType).toStrictEqual('search');
      expect(query.operationType).toStrictEqual('read');
      expect(query.scope).toStrictEqual('collection');
      expect(query.count).toStrictEqual(true);
    })

    it('Should set "distinct" option', async () => {
      const resource = service.getEntityResource('Customers');
      const query = ExecutionQuery.forSearch(resource, {distinct: true}) as SearchQuery;
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.queryType).toStrictEqual('search');
      expect(query.operationType).toStrictEqual('read');
      expect(query.scope).toStrictEqual('collection');
      expect(query.distinct).toStrictEqual(true);
    })

    it('Should set "pick" option', async () => {
      const resource = service.getEntityResource('Customers');
      const query = ExecutionQuery.forSearch(resource, {pick: ['givenName', 'gender', 'address.city']}) as SearchQuery;
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.queryType).toStrictEqual('search');
      expect(query.operationType).toStrictEqual('read');
      expect(query.scope).toStrictEqual('collection');
      expect(query.pick).toStrictEqual(['givenName', 'gender', 'address.city']);
    })

    it('Should normalize field names in "pick" option', async () => {
      const resource = service.getEntityResource('Customers');
      let query = ExecutionQuery.forSearch(resource, {pick: ['givenname', 'GENDER', 'AdDRess.CIty']});
      expect(query.pick).toStrictEqual(['givenName', 'gender', 'address.city']);
      query = ExecutionQuery.forSearch(resource, {pick: ['address', 'address.city']});
      expect(query.pick).toStrictEqual(['address']);
      query = ExecutionQuery.forSearch(resource, {pick: ['address.city', 'address']});
      expect(query.pick).toStrictEqual(['address']);
    })

    it('Should check if fields exist in "pick" option', async () => {
      const resource = service.getEntityResource('Customers');
      expect(() => ExecutionQuery.forSearch(resource, {pick: ['unknownField', 'gender']}))
          .toThrow('Unknown field path "Customers.unknownField"');
      expect(() => ExecutionQuery.forSearch(resource, {pick: ['address.unknownField', 'gender']}))
          .toThrow('Unknown field path "Customers.address.unknownField"');
      expect(() => ExecutionQuery.forSearch(resource, {pick: ['address.country.unknownField', 'gender']}))
          .toThrow('Unknown field path "Customers.address.country.unknownField"');
    })

    it('Should allow unknown fields in "pick" option if additionalProperties set to "true"', async () => {
      const resource = service.getEntityResource('Customers');
      const query = ExecutionQuery.forSearch(resource, {pick: ['notes.add1', 'notes.add2.add3']});
      expect(query.pick).toStrictEqual(['notes.add1', 'notes.add2.add3']);
    })

    it('Should set "omit" option', async () => {
      const resource = service.getEntityResource('Customers');
      const query = ExecutionQuery.forSearch(resource, {omit: ['givenName', 'gender', 'address.city']}) as SearchQuery;
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.queryType).toStrictEqual('search');
      expect(query.operationType).toStrictEqual('read');
      expect(query.scope).toStrictEqual('collection');
      expect(query.omit).toStrictEqual(['givenName', 'gender', 'address.city']);
    })

    it('Should normalize field names in "omit" option', async () => {
      const resource = service.getEntityResource('Customers');
      let query = ExecutionQuery.forSearch(resource, {omit: ['givenname', 'GENDER', 'AdDRess.CIty']});
      expect(query.omit).toStrictEqual(['givenName', 'gender', 'address.city']);
      query = ExecutionQuery.forSearch(resource, {omit: ['address', 'address.city']});
      expect(query.omit).toStrictEqual(['address']);
      query = ExecutionQuery.forSearch(resource, {omit: ['address.city', 'address']});
      expect(query.omit).toStrictEqual(['address']);
    })

    it('Should check if fields exist in "omit" option', async () => {
      const resource = service.getEntityResource('Customers');
      expect(() => ExecutionQuery.forSearch(resource, {omit: ['unknownField', 'gender']}))
          .toThrow('Unknown field path "Customers.unknownField"');
      expect(() => ExecutionQuery.forSearch(resource, {omit: ['address.unknownField', 'gender']}))
          .toThrow('Unknown field path "Customers.address.unknownField"');
      expect(() => ExecutionQuery.forSearch(resource, {omit: ['address.country.unknownField', 'gender']}))
          .toThrow('Unknown field path "Customers.address.country.unknownField"');
    })

    it('Should allow unknown fields in "omit" option if additionalProperties set to "true"', async () => {
      const resource = service.getEntityResource('Customers');
      const query = ExecutionQuery.forSearch(resource, {omit: ['notes.add1', 'notes.add2.add3']});
      expect(query.omit).toStrictEqual(['notes.add1', 'notes.add2.add3']);
    })

    it('Should set "include" option', async () => {
      const resource = service.getEntityResource('Customers');
      const query = ExecutionQuery.forSearch(resource, {include: ['givenName', 'gender', 'address.city']}) as SearchQuery;
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.queryType).toStrictEqual('search');
      expect(query.operationType).toStrictEqual('read');
      expect(query.scope).toStrictEqual('collection');
      expect(query.include).toStrictEqual(['givenName', 'gender', 'address.city']);
    })

    it('Should normalize field names in "include" option', async () => {
      const resource = service.getEntityResource('Customers');
      let query = ExecutionQuery.forSearch(resource, {include: ['givenname', 'GENDER', 'AdDRess.CIty']});
      expect(query.include).toStrictEqual(['givenName', 'gender', 'address.city']);
      query = ExecutionQuery.forSearch(resource, {include: ['address', 'address.city']});
      expect(query.include).toStrictEqual(['address']);
      query = ExecutionQuery.forSearch(resource, {include: ['address.city', 'address']});
      expect(query.include).toStrictEqual(['address']);
    })

    it('Should allow unknown fields in "include" option if additionalProperties set to "true"', async () => {
      const resource = service.getEntityResource('Customers');
      const query = ExecutionQuery.forSearch(resource, {include: ['notes.add1', 'notes.add2.add3']});
      expect(query.include).toStrictEqual(['notes.add1', 'notes.add2.add3']);
    })

    it('Should check if fields exist in "include" option', async () => {
      const resource = service.getEntityResource('Customers');
      expect(() => ExecutionQuery.forSearch(resource, {include: ['unknownField', 'gender']}))
          .toThrow('Unknown field path "Customers.unknownField"');
      expect(() => ExecutionQuery.forSearch(resource, {include: ['address.unknownField', 'gender']}))
          .toThrow('Unknown field path "Customers.address.unknownField"');
      expect(() => ExecutionQuery.forSearch(resource, {include: ['address.country.unknownField', 'gender']}))
          .toThrow('Unknown field path "Customers.address.country.unknownField"');
    })

    it('Should set "sort" option', async () => {
      const resource = service.getEntityResource('Customers');
      const query = ExecutionQuery.forSearch(resource, {sort: ['givenName', 'gender', 'address.city']}) as SearchQuery;
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.queryType).toStrictEqual('search');
      expect(query.operationType).toStrictEqual('read');
      expect(query.scope).toStrictEqual('collection');
      expect(query.sort).toStrictEqual(['givenName', 'gender', 'address.city']);
    })

    it('Should normalize field names in "sort" option', async () => {
      const resource = service.getEntityResource('Customers');
      let query = ExecutionQuery.forSearch(resource, {sort: ['givenname', 'GENDER', 'AdDRess.CIty']});
      expect(query.sort).toStrictEqual(['givenName', 'gender', 'address.city']);
      query = ExecutionQuery.forSearch(resource, {sort: ['address', 'address.city']});
      expect(query.sort).toStrictEqual(['address']);
      query = ExecutionQuery.forSearch(resource, {sort: ['address.city', 'address']});
      expect(query.sort).toStrictEqual(['address']);
    })

    it('Should check if fields exist in "sort" option', async () => {
      const resource = service.getEntityResource('Customers');
      expect(() => ExecutionQuery.forSearch(resource, {sort: ['unknownField', 'gender']}))
          .toThrow('Unknown field path "Customers.unknownField"');
      expect(() => ExecutionQuery.forSearch(resource, {sort: ['address.unknownField', 'gender']}))
          .toThrow('Unknown field path "Customers.address.unknownField"');
      expect(() => ExecutionQuery.forSearch(resource, {sort: ['address.country.unknownField', 'gender']}))
          .toThrow('Unknown field path "Customers.address.country.unknownField"');
    })
  });

  describe('forCreate()', function () {
    const data = {name: 'x'};
    it('Should create CreateQuery', async () => {
      const resource = service.getEntityResource('Customers');
      const query = ExecutionQuery.forCreate(resource, data) as CreateQuery;
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.queryType).toStrictEqual('create');
      expect(query.operationType).toStrictEqual('create');
      expect(query.scope).toStrictEqual('collection');
      expect(query.data).toStrictEqual({name: 'x'});
    })

    it('Should set "pick" option', async () => {
      const resource = service.getEntityResource('Customers');
      const query = ExecutionQuery.forCreate(resource, data, {pick: ['givenName', 'gender', 'address.city']}) as CreateQuery;
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.queryType).toStrictEqual('create');
      expect(query.pick).toStrictEqual(['givenName', 'gender', 'address.city']);
    })

    it('Should normalize field names in "pick" option', async () => {
      const resource = service.getEntityResource('Customers');
      let query = ExecutionQuery.forCreate(resource, data, {pick: ['givenname', 'GENDER', 'AdDRess.CIty']}) as CreateQuery;
      expect(query.pick).toStrictEqual(['givenName', 'gender', 'address.city']);
      query = ExecutionQuery.forCreate(resource, data, {pick: ['address', 'address.city']});
      expect(query.pick).toStrictEqual(['address']);
      query = ExecutionQuery.forCreate(resource, data, {pick: ['address.city', 'address']});
      expect(query.pick).toStrictEqual(['address']);
    })

    it('Should set "omit" option', async () => {
      const resource = service.getEntityResource('Customers');
      const query = ExecutionQuery.forCreate(resource, data, {omit: ['givenName', 'gender', 'address.city']}) as CreateQuery;
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.queryType).toStrictEqual('create');
      expect(query.omit).toStrictEqual(['givenName', 'gender', 'address.city']);
    })

    it('Should normalize field names in "omit" option', async () => {
      const resource = service.getEntityResource('Customers');
      let query = ExecutionQuery.forCreate(resource, data, {omit: ['givenname', 'GENDER', 'AdDRess.CIty']}) as CreateQuery;
      expect(query.omit).toStrictEqual(['givenName', 'gender', 'address.city']);
      query = ExecutionQuery.forCreate(resource, data, {omit: ['address', 'address.city']});
      expect(query.omit).toStrictEqual(['address']);
      query = ExecutionQuery.forCreate(resource, data, {omit: ['address.city', 'address']});
      expect(query.omit).toStrictEqual(['address']);
    })

    it('Should set "include" option', async () => {
      const resource = service.getEntityResource('Customers');
      const query = ExecutionQuery.forCreate(resource, data, {include: ['givenName', 'gender', 'address.city']}) as CreateQuery;
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.queryType).toStrictEqual('create');
      expect(query.include).toStrictEqual(['givenName', 'gender', 'address.city']);
    })

    it('Should normalize field names in "include" option', async () => {
      const resource = service.getEntityResource('Customers');
      let query = ExecutionQuery.forCreate(resource, data, {include: ['givenname', 'GENDER', 'AdDRess.CIty']}) as CreateQuery;
      expect(query.include).toStrictEqual(['givenName', 'gender', 'address.city']);
      query = ExecutionQuery.forCreate(resource, data, {include: ['address', 'address.city']});
      expect(query.include).toStrictEqual(['address']);
      query = ExecutionQuery.forCreate(resource, data, {include: ['address.city', 'address']});
      expect(query.include).toStrictEqual(['address']);
    })
  });

  describe('forRead()', function () {
    const id = 123;
    it('Should create ReadQuery', async () => {
      const resource = service.getEntityResource('Customers');
      const query = ExecutionQuery.forGet(resource, id) as GetQuery;
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.queryType).toStrictEqual('get');
      expect(query.operationType).toStrictEqual('read');
      expect(query.scope).toStrictEqual('instance');
      expect(query.keyValue).toStrictEqual(id);
    })

    it('Should set "pick" option', async () => {
      const resource = service.getEntityResource('Customers');
      const query = ExecutionQuery.forGet(resource, id, {pick: ['givenName', 'gender', 'address.city']}) as GetQuery;
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.queryType).toStrictEqual('get');
      expect(query.pick).toStrictEqual(['givenName', 'gender', 'address.city']);
    })

    it('Should normalize field names in "pick" option', async () => {
      const resource = service.getEntityResource('Customers');
      let query = ExecutionQuery.forGet(resource, id, {pick: ['givenname', 'GENDER', 'AdDRess.CIty']}) as GetQuery;
      expect(query.pick).toStrictEqual(['givenName', 'gender', 'address.city']);
      query = ExecutionQuery.forGet(resource, id, {pick: ['address', 'address.city']});
      expect(query.pick).toStrictEqual(['address']);
      query = ExecutionQuery.forGet(resource, id, {pick: ['address.city', 'address']});
      expect(query.pick).toStrictEqual(['address']);
    })

    it('Should set "omit" option', async () => {
      const resource = service.getEntityResource('Customers');
      const query = ExecutionQuery.forGet(resource, id, {omit: ['givenName', 'gender', 'address.city']}) as GetQuery;
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.queryType).toStrictEqual('get');
      expect(query.omit).toStrictEqual(['givenName', 'gender', 'address.city']);
    })

    it('Should normalize field names in "omit" option', async () => {
      const resource = service.getEntityResource('Customers');
      let query = ExecutionQuery.forGet(resource, id, {omit: ['givenname', 'GENDER', 'AdDRess.CIty']}) as GetQuery;
      expect(query.omit).toStrictEqual(['givenName', 'gender', 'address.city']);
      query = ExecutionQuery.forGet(resource, id, {omit: ['address', 'address.city']});
      expect(query.omit).toStrictEqual(['address']);
      query = ExecutionQuery.forGet(resource, id, {omit: ['address.city', 'address']});
      expect(query.omit).toStrictEqual(['address']);
    })

    it('Should set "include" option', async () => {
      const resource = service.getEntityResource('Customers');
      const query = ExecutionQuery.forGet(resource, id, {include: ['givenName', 'gender', 'address.city']}) as GetQuery;
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.queryType).toStrictEqual('get');
      expect(query.include).toStrictEqual(['givenName', 'gender', 'address.city']);
    })

    it('Should normalize field names in "include" option', async () => {
      const resource = service.getEntityResource('Customers');
      let query = ExecutionQuery.forGet(resource, id, {include: ['givenname', 'GENDER', 'AdDRess.CIty']}) as GetQuery;
      expect(query.include).toStrictEqual(['givenName', 'gender', 'address.city']);
      query = ExecutionQuery.forGet(resource, id, {include: ['address', 'address.city']});
      expect(query.include).toStrictEqual(['address']);
      query = ExecutionQuery.forGet(resource, id, {include: ['address.city', 'address']});
      expect(query.include).toStrictEqual(['address']);
    })
  });

  describe('forUpdate()', function () {
    const data = {name: 'x'};
    const id = 123;
    it('Should create UpdateQuery', async () => {
      const resource = service.getEntityResource('Customers');
      const query = ExecutionQuery.forUpdate(resource, id, data) as UpdateQuery;
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.queryType).toStrictEqual('update');
      expect(query.operationType).toStrictEqual('update');
      expect(query.scope).toStrictEqual('instance');
      expect(query.keyValue).toStrictEqual(id);
      expect(query.data).toStrictEqual({name: 'x'});
    })

    it('Should set "pick" option', async () => {
      const resource = service.getEntityResource('Customers');
      const query = ExecutionQuery.forUpdate(resource, data, id, {pick: ['givenName', 'gender', 'address.city']}) as UpdateQuery;
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.queryType).toStrictEqual('update');
      expect(query.pick).toStrictEqual(['givenName', 'gender', 'address.city']);
    })

    it('Should normalize field names in "pick" option', async () => {
      const resource = service.getEntityResource('Customers');
      let query = ExecutionQuery.forUpdate(resource, data, id, {pick: ['givenname', 'GENDER', 'AdDRess.CIty']}) as UpdateQuery;
      expect(query.pick).toStrictEqual(['givenName', 'gender', 'address.city']);
      query = ExecutionQuery.forUpdate(resource, data, id, {pick: ['address', 'address.city']});
      expect(query.pick).toStrictEqual(['address']);
      query = ExecutionQuery.forUpdate(resource, data, id, {pick: ['address.city', 'address']});
      expect(query.pick).toStrictEqual(['address']);
    })

    it('Should set "omit" option', async () => {
      const resource = service.getEntityResource('Customers');
      const query = ExecutionQuery.forUpdate(resource, data, id, {omit: ['givenName', 'gender', 'address.city']}) as UpdateQuery;
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.queryType).toStrictEqual('update');
      expect(query.omit).toStrictEqual(['givenName', 'gender', 'address.city']);
    })

    it('Should normalize field names in "omit" option', async () => {
      const resource = service.getEntityResource('Customers');
      let query = ExecutionQuery.forUpdate(resource, data, id, {omit: ['givenname', 'GENDER', 'AdDRess.CIty']}) as UpdateQuery;
      expect(query.omit).toStrictEqual(['givenName', 'gender', 'address.city']);
      query = ExecutionQuery.forUpdate(resource, data, id, {omit: ['address', 'address.city']});
      expect(query.omit).toStrictEqual(['address']);
      query = ExecutionQuery.forUpdate(resource, data, id, {omit: ['address.city', 'address']});
      expect(query.omit).toStrictEqual(['address']);
    })

    it('Should set "include" option', async () => {
      const resource = service.getEntityResource('Customers');
      const query = ExecutionQuery.forUpdate(resource, data, id, {include: ['givenName', 'gender', 'address.city']}) as UpdateQuery;
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.queryType).toStrictEqual('update');
      expect(query.include).toStrictEqual(['givenName', 'gender', 'address.city']);
    })

    it('Should normalize field names in "include" option', async () => {
      const resource = service.getEntityResource('Customers');
      let query = ExecutionQuery.forUpdate(resource, data, id, {include: ['givenname', 'GENDER', 'AdDRess.CIty']}) as UpdateQuery;
      expect(query.include).toStrictEqual(['givenName', 'gender', 'address.city']);
      query = ExecutionQuery.forUpdate(resource, data, id, {include: ['address', 'address.city']});
      expect(query.include).toStrictEqual(['address']);
      query = ExecutionQuery.forUpdate(resource, data, id, {include: ['address.city', 'address']});
      expect(query.include).toStrictEqual(['address']);
    })
  });


  describe('forUpdateMany()', function () {
    const data = {name: 'x'};
    it('Should create UpdateManyQuery', async () => {
      const resource = service.getEntityResource('Customers');
      const query = ExecutionQuery.forUpdateMany(resource, data, {filter: 'id=1'}) as UpdateManyQuery;
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.queryType).toStrictEqual('updateMany');
      expect(query.operationType).toStrictEqual('update');
      expect(query.scope).toStrictEqual('collection');
      expect(query.data).toStrictEqual(data);
      expect(query.filter).toStrictEqual('id=1');
    })
  });


  describe('forDelete()', function () {
    const id = 123;
    it('Should create DeleteQuery', async () => {
      const resource = service.getEntityResource('Customers');
      const query = ExecutionQuery.forDelete(resource, id) as DeleteQuery;
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.queryType).toStrictEqual('delete');
      expect(query.operationType).toStrictEqual('delete');
      expect(query.scope).toStrictEqual('instance');
      expect(query.keyValue).toStrictEqual(id);
    })
  });

  describe('forDeleteMany()', function () {
    it('Should create DeleteManyQuery', async () => {
      const resource = service.getEntityResource('Customers');
      const query = ExecutionQuery.forDeleteMany(resource, {filter: 'id=1'}) as DeleteManyQuery;
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.queryType).toStrictEqual('deleteMany');
      expect(query.operationType).toStrictEqual('delete');
      expect(query.scope).toStrictEqual('collection');
      expect(query.filter).toStrictEqual('id=1');
    })

  });

});
