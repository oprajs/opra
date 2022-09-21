import 'reflect-metadata';
import {
  OpraCreateQuery, OpraDeleteManyQuery,
  OpraDeleteQuery,
  OpraGetQuery,
  OpraQuery,
  OpraSearchQuery, OpraService,
  OpraUpdateManyQuery,
  OpraUpdateQuery
} from '../../src/index.js';
import { CustomerAddressesesResource } from '../_support/test-app/api/customer-addresseses.resource.js';
import { CustomersResource } from '../_support/test-app/api/customers.resource.js';
import { Address } from '../_support/test-app/dto/address.dto.js';
import { Customer } from '../_support/test-app/dto/customer.dto.js';

describe('OpraQuery', function () {
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
      const query = OpraQuery.forSearch(resource, {}) as OpraSearchQuery;
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.queryType).toStrictEqual('search');
      expect(query.operation).toStrictEqual('read');
      expect(query.scope).toStrictEqual('collection');
    })

    it('Should set "limit" option', async () => {
      const resource = service.getEntityResource('Customers');
      const query = OpraQuery.forSearch(resource, {limit: 5}) as OpraSearchQuery;
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.queryType).toStrictEqual('search');
      expect(query.operation).toStrictEqual('read');
      expect(query.scope).toStrictEqual('collection');
      expect(query.limit).toStrictEqual(5);
    })

    it('Should set "skip" option', async () => {
      const resource = service.getEntityResource('Customers');
      const query = OpraQuery.forSearch(resource, {skip: 5}) as OpraSearchQuery;
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.queryType).toStrictEqual('search');
      expect(query.operation).toStrictEqual('read');
      expect(query.scope).toStrictEqual('collection');
      expect(query.skip).toStrictEqual(5);
    })

    it('Should set "total" option', async () => {
      const resource = service.getEntityResource('Customers');
      const query = OpraQuery.forSearch(resource, {count: true}) as OpraSearchQuery;
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.queryType).toStrictEqual('search');
      expect(query.operation).toStrictEqual('read');
      expect(query.scope).toStrictEqual('collection');
      expect(query.count).toStrictEqual(true);
    })

    it('Should set "distinct" option', async () => {
      const resource = service.getEntityResource('Customers');
      const query = OpraQuery.forSearch(resource, {distinct: true}) as OpraSearchQuery;
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.queryType).toStrictEqual('search');
      expect(query.operation).toStrictEqual('read');
      expect(query.scope).toStrictEqual('collection');
      expect(query.distinct).toStrictEqual(true);
    })

    it('Should set "pick" option', async () => {
      const resource = service.getEntityResource('Customers');
      const query = OpraQuery.forSearch(resource, {pick: ['givenName', 'gender', 'address.city']}) as OpraSearchQuery;
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.queryType).toStrictEqual('search');
      expect(query.operation).toStrictEqual('read');
      expect(query.scope).toStrictEqual('collection');
      expect(query.pick).toStrictEqual(['givenName', 'gender', 'address.city']);
    })

    it('Should normalize field names in "pick" option', async () => {
      const resource = service.getEntityResource('Customers');
      let query = OpraQuery.forSearch(resource, {pick: ['givenname', 'GENDER', 'AdDRess.CIty']});
      expect(query.pick).toStrictEqual(['givenName', 'gender', 'address.city']);
      query = OpraQuery.forSearch(resource, {pick: ['address', 'address.city']});
      expect(query.pick).toStrictEqual(['address']);
      query = OpraQuery.forSearch(resource, {pick: ['address.city', 'address']});
      expect(query.pick).toStrictEqual(['address']);
    })

    it('Should check if fields exist in "pick" option', async () => {
      const resource = service.getEntityResource('Customers');
      expect(() => OpraQuery.forSearch(resource, {pick: ['unknownField', 'gender']}))
          .toThrow('Unknown field path "Customers.unknownField"');
      expect(() => OpraQuery.forSearch(resource, {pick: ['address.unknownField', 'gender']}))
          .toThrow('Unknown field path "Customers.address.unknownField"');
      expect(() => OpraQuery.forSearch(resource, {pick: ['address.country.unknownField', 'gender']}))
          .toThrow('Unknown field path "Customers.address.country.unknownField"');
    })

    it('Should allow unknown fields in "pick" option if additionalProperties set to "true"', async () => {
      const resource = service.getEntityResource('Customers');
      const query = OpraQuery.forSearch(resource, {pick: ['notes.add1', 'notes.add2.add3']});
      expect(query.pick).toStrictEqual(['notes.add1', 'notes.add2.add3']);
    })

    it('Should set "omit" option', async () => {
      const resource = service.getEntityResource('Customers');
      const query = OpraQuery.forSearch(resource, {omit: ['givenName', 'gender', 'address.city']}) as OpraSearchQuery;
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.queryType).toStrictEqual('search');
      expect(query.operation).toStrictEqual('read');
      expect(query.scope).toStrictEqual('collection');
      expect(query.omit).toStrictEqual(['givenName', 'gender', 'address.city']);
    })

    it('Should normalize field names in "omit" option', async () => {
      const resource = service.getEntityResource('Customers');
      let query = OpraQuery.forSearch(resource, {omit: ['givenname', 'GENDER', 'AdDRess.CIty']});
      expect(query.omit).toStrictEqual(['givenName', 'gender', 'address.city']);
      query = OpraQuery.forSearch(resource, {omit: ['address', 'address.city']});
      expect(query.omit).toStrictEqual(['address']);
      query = OpraQuery.forSearch(resource, {omit: ['address.city', 'address']});
      expect(query.omit).toStrictEqual(['address']);
    })

    it('Should check if fields exist in "omit" option', async () => {
      const resource = service.getEntityResource('Customers');
      expect(() => OpraQuery.forSearch(resource, {omit: ['unknownField', 'gender']}))
          .toThrow('Unknown field path "Customers.unknownField"');
      expect(() => OpraQuery.forSearch(resource, {omit: ['address.unknownField', 'gender']}))
          .toThrow('Unknown field path "Customers.address.unknownField"');
      expect(() => OpraQuery.forSearch(resource, {omit: ['address.country.unknownField', 'gender']}))
          .toThrow('Unknown field path "Customers.address.country.unknownField"');
    })

    it('Should allow unknown fields in "omit" option if additionalProperties set to "true"', async () => {
      const resource = service.getEntityResource('Customers');
      const query = OpraQuery.forSearch(resource, {omit: ['notes.add1', 'notes.add2.add3']});
      expect(query.omit).toStrictEqual(['notes.add1', 'notes.add2.add3']);
    })

    it('Should set "include" option', async () => {
      const resource = service.getEntityResource('Customers');
      const query = OpraQuery.forSearch(resource, {include: ['givenName', 'gender', 'address.city']}) as OpraSearchQuery;
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.queryType).toStrictEqual('search');
      expect(query.operation).toStrictEqual('read');
      expect(query.scope).toStrictEqual('collection');
      expect(query.include).toStrictEqual(['givenName', 'gender', 'address.city']);
    })

    it('Should normalize field names in "include" option', async () => {
      const resource = service.getEntityResource('Customers');
      let query = OpraQuery.forSearch(resource, {include: ['givenname', 'GENDER', 'AdDRess.CIty']});
      expect(query.include).toStrictEqual(['givenName', 'gender', 'address.city']);
      query = OpraQuery.forSearch(resource, {include: ['address', 'address.city']});
      expect(query.include).toStrictEqual(['address']);
      query = OpraQuery.forSearch(resource, {include: ['address.city', 'address']});
      expect(query.include).toStrictEqual(['address']);
    })

    it('Should allow unknown fields in "include" option if additionalProperties set to "true"', async () => {
      const resource = service.getEntityResource('Customers');
      const query = OpraQuery.forSearch(resource, {include: ['notes.add1', 'notes.add2.add3']});
      expect(query.include).toStrictEqual(['notes.add1', 'notes.add2.add3']);
    })

    it('Should check if fields exist in "include" option', async () => {
      const resource = service.getEntityResource('Customers');
      expect(() => OpraQuery.forSearch(resource, {include: ['unknownField', 'gender']}))
          .toThrow('Unknown field path "Customers.unknownField"');
      expect(() => OpraQuery.forSearch(resource, {include: ['address.unknownField', 'gender']}))
          .toThrow('Unknown field path "Customers.address.unknownField"');
      expect(() => OpraQuery.forSearch(resource, {include: ['address.country.unknownField', 'gender']}))
          .toThrow('Unknown field path "Customers.address.country.unknownField"');
    })

    it('Should set "sort" option', async () => {
      const resource = service.getEntityResource('Customers');
      const query = OpraQuery.forSearch(resource, {sort: ['givenName', 'gender', 'address.city']}) as OpraSearchQuery;
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.queryType).toStrictEqual('search');
      expect(query.operation).toStrictEqual('read');
      expect(query.scope).toStrictEqual('collection');
      expect(query.sort).toStrictEqual(['givenName', 'gender', 'address.city']);
    })

    it('Should normalize field names in "sort" option', async () => {
      const resource = service.getEntityResource('Customers');
      let query = OpraQuery.forSearch(resource, {sort: ['givenname', 'GENDER', 'AdDRess.CIty']});
      expect(query.sort).toStrictEqual(['givenName', 'gender', 'address.city']);
      query = OpraQuery.forSearch(resource, {sort: ['address', 'address.city']});
      expect(query.sort).toStrictEqual(['address']);
      query = OpraQuery.forSearch(resource, {sort: ['address.city', 'address']});
      expect(query.sort).toStrictEqual(['address']);
    })

    it('Should check if fields exist in "sort" option', async () => {
      const resource = service.getEntityResource('Customers');
      expect(() => OpraQuery.forSearch(resource, {sort: ['unknownField', 'gender']}))
          .toThrow('Unknown field path "Customers.unknownField"');
      expect(() => OpraQuery.forSearch(resource, {sort: ['address.unknownField', 'gender']}))
          .toThrow('Unknown field path "Customers.address.unknownField"');
      expect(() => OpraQuery.forSearch(resource, {sort: ['address.country.unknownField', 'gender']}))
          .toThrow('Unknown field path "Customers.address.country.unknownField"');
    })
  });

  describe('forCreate()', function () {
    const data = {name: 'x'};
    it('Should create CreateQuery', async () => {
      const resource = service.getEntityResource('Customers');
      const query = OpraQuery.forCreate(resource, data) as OpraCreateQuery;
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.queryType).toStrictEqual('create');
      expect(query.operation).toStrictEqual('create');
      expect(query.scope).toStrictEqual('collection');
      expect(query.data).toStrictEqual({name: 'x'});
    })

    it('Should set "pick" option', async () => {
      const resource = service.getEntityResource('Customers');
      const query = OpraQuery.forCreate(resource, data, {pick: ['givenName', 'gender', 'address.city']}) as OpraCreateQuery;
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.queryType).toStrictEqual('create');
      expect(query.pick).toStrictEqual(['givenName', 'gender', 'address.city']);
    })

    it('Should normalize field names in "pick" option', async () => {
      const resource = service.getEntityResource('Customers');
      let query = OpraQuery.forCreate(resource, data, {pick: ['givenname', 'GENDER', 'AdDRess.CIty']}) as OpraCreateQuery;
      expect(query.pick).toStrictEqual(['givenName', 'gender', 'address.city']);
      query = OpraQuery.forCreate(resource, data, {pick: ['address', 'address.city']});
      expect(query.pick).toStrictEqual(['address']);
      query = OpraQuery.forCreate(resource, data, {pick: ['address.city', 'address']});
      expect(query.pick).toStrictEqual(['address']);
    })

    it('Should set "omit" option', async () => {
      const resource = service.getEntityResource('Customers');
      const query = OpraQuery.forCreate(resource, data, {omit: ['givenName', 'gender', 'address.city']}) as OpraCreateQuery;
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.queryType).toStrictEqual('create');
      expect(query.omit).toStrictEqual(['givenName', 'gender', 'address.city']);
    })

    it('Should normalize field names in "omit" option', async () => {
      const resource = service.getEntityResource('Customers');
      let query = OpraQuery.forCreate(resource, data, {omit: ['givenname', 'GENDER', 'AdDRess.CIty']}) as OpraCreateQuery;
      expect(query.omit).toStrictEqual(['givenName', 'gender', 'address.city']);
      query = OpraQuery.forCreate(resource, data, {omit: ['address', 'address.city']});
      expect(query.omit).toStrictEqual(['address']);
      query = OpraQuery.forCreate(resource, data, {omit: ['address.city', 'address']});
      expect(query.omit).toStrictEqual(['address']);
    })

    it('Should set "include" option', async () => {
      const resource = service.getEntityResource('Customers');
      const query = OpraQuery.forCreate(resource, data, {include: ['givenName', 'gender', 'address.city']}) as OpraCreateQuery;
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.queryType).toStrictEqual('create');
      expect(query.include).toStrictEqual(['givenName', 'gender', 'address.city']);
    })

    it('Should normalize field names in "include" option', async () => {
      const resource = service.getEntityResource('Customers');
      let query = OpraQuery.forCreate(resource, data, {include: ['givenname', 'GENDER', 'AdDRess.CIty']}) as OpraCreateQuery;
      expect(query.include).toStrictEqual(['givenName', 'gender', 'address.city']);
      query = OpraQuery.forCreate(resource, data, {include: ['address', 'address.city']});
      expect(query.include).toStrictEqual(['address']);
      query = OpraQuery.forCreate(resource, data, {include: ['address.city', 'address']});
      expect(query.include).toStrictEqual(['address']);
    })
  });

  describe('forRead()', function () {
    const id = 123;
    it('Should create ReadQuery', async () => {
      const resource = service.getEntityResource('Customers');
      const query = OpraQuery.forGet(resource, id) as OpraGetQuery;
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.queryType).toStrictEqual('get');
      expect(query.operation).toStrictEqual('read');
      expect(query.scope).toStrictEqual('instance');
      expect(query.keyValue).toStrictEqual(id);
    })

    it('Should set "pick" option', async () => {
      const resource = service.getEntityResource('Customers');
      const query = OpraQuery.forGet(resource, id, {pick: ['givenName', 'gender', 'address.city']}) as OpraGetQuery;
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.queryType).toStrictEqual('get');
      expect(query.pick).toStrictEqual(['givenName', 'gender', 'address.city']);
    })

    it('Should normalize field names in "pick" option', async () => {
      const resource = service.getEntityResource('Customers');
      let query = OpraQuery.forGet(resource, id, {pick: ['givenname', 'GENDER', 'AdDRess.CIty']}) as OpraGetQuery;
      expect(query.pick).toStrictEqual(['givenName', 'gender', 'address.city']);
      query = OpraQuery.forGet(resource, id, {pick: ['address', 'address.city']});
      expect(query.pick).toStrictEqual(['address']);
      query = OpraQuery.forGet(resource, id, {pick: ['address.city', 'address']});
      expect(query.pick).toStrictEqual(['address']);
    })

    it('Should set "omit" option', async () => {
      const resource = service.getEntityResource('Customers');
      const query = OpraQuery.forGet(resource, id, {omit: ['givenName', 'gender', 'address.city']}) as OpraGetQuery;
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.queryType).toStrictEqual('get');
      expect(query.omit).toStrictEqual(['givenName', 'gender', 'address.city']);
    })

    it('Should normalize field names in "omit" option', async () => {
      const resource = service.getEntityResource('Customers');
      let query = OpraQuery.forGet(resource, id, {omit: ['givenname', 'GENDER', 'AdDRess.CIty']}) as OpraGetQuery;
      expect(query.omit).toStrictEqual(['givenName', 'gender', 'address.city']);
      query = OpraQuery.forGet(resource, id, {omit: ['address', 'address.city']});
      expect(query.omit).toStrictEqual(['address']);
      query = OpraQuery.forGet(resource, id, {omit: ['address.city', 'address']});
      expect(query.omit).toStrictEqual(['address']);
    })

    it('Should set "include" option', async () => {
      const resource = service.getEntityResource('Customers');
      const query = OpraQuery.forGet(resource, id, {include: ['givenName', 'gender', 'address.city']}) as OpraGetQuery;
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.queryType).toStrictEqual('get');
      expect(query.include).toStrictEqual(['givenName', 'gender', 'address.city']);
    })

    it('Should normalize field names in "include" option', async () => {
      const resource = service.getEntityResource('Customers');
      let query = OpraQuery.forGet(resource, id, {include: ['givenname', 'GENDER', 'AdDRess.CIty']}) as OpraGetQuery;
      expect(query.include).toStrictEqual(['givenName', 'gender', 'address.city']);
      query = OpraQuery.forGet(resource, id, {include: ['address', 'address.city']});
      expect(query.include).toStrictEqual(['address']);
      query = OpraQuery.forGet(resource, id, {include: ['address.city', 'address']});
      expect(query.include).toStrictEqual(['address']);
    })
  });

  describe('forUpdate()', function () {
    const data = {name: 'x'};
    const id = 123;
    it('Should create UpdateQuery', async () => {
      const resource = service.getEntityResource('Customers');
      const query = OpraQuery.forUpdate(resource, id, data) as OpraUpdateQuery;
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.queryType).toStrictEqual('update');
      expect(query.operation).toStrictEqual('update');
      expect(query.scope).toStrictEqual('instance');
      expect(query.keyValue).toStrictEqual(id);
      expect(query.data).toStrictEqual({name: 'x'});
    })

    it('Should set "pick" option', async () => {
      const resource = service.getEntityResource('Customers');
      const query = OpraQuery.forUpdate(resource, data, id, {pick: ['givenName', 'gender', 'address.city']}) as OpraUpdateQuery;
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.queryType).toStrictEqual('update');
      expect(query.pick).toStrictEqual(['givenName', 'gender', 'address.city']);
    })

    it('Should normalize field names in "pick" option', async () => {
      const resource = service.getEntityResource('Customers');
      let query = OpraQuery.forUpdate(resource, data, id, {pick: ['givenname', 'GENDER', 'AdDRess.CIty']}) as OpraUpdateQuery;
      expect(query.pick).toStrictEqual(['givenName', 'gender', 'address.city']);
      query = OpraQuery.forUpdate(resource, data, id, {pick: ['address', 'address.city']});
      expect(query.pick).toStrictEqual(['address']);
      query = OpraQuery.forUpdate(resource, data, id, {pick: ['address.city', 'address']});
      expect(query.pick).toStrictEqual(['address']);
    })

    it('Should set "omit" option', async () => {
      const resource = service.getEntityResource('Customers');
      const query = OpraQuery.forUpdate(resource, data, id, {omit: ['givenName', 'gender', 'address.city']}) as OpraUpdateQuery;
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.queryType).toStrictEqual('update');
      expect(query.omit).toStrictEqual(['givenName', 'gender', 'address.city']);
    })

    it('Should normalize field names in "omit" option', async () => {
      const resource = service.getEntityResource('Customers');
      let query = OpraQuery.forUpdate(resource, data, id, {omit: ['givenname', 'GENDER', 'AdDRess.CIty']}) as OpraUpdateQuery;
      expect(query.omit).toStrictEqual(['givenName', 'gender', 'address.city']);
      query = OpraQuery.forUpdate(resource, data, id, {omit: ['address', 'address.city']});
      expect(query.omit).toStrictEqual(['address']);
      query = OpraQuery.forUpdate(resource, data, id, {omit: ['address.city', 'address']});
      expect(query.omit).toStrictEqual(['address']);
    })

    it('Should set "include" option', async () => {
      const resource = service.getEntityResource('Customers');
      const query = OpraQuery.forUpdate(resource, data, id, {include: ['givenName', 'gender', 'address.city']}) as OpraUpdateQuery;
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.queryType).toStrictEqual('update');
      expect(query.include).toStrictEqual(['givenName', 'gender', 'address.city']);
    })

    it('Should normalize field names in "include" option', async () => {
      const resource = service.getEntityResource('Customers');
      let query = OpraQuery.forUpdate(resource, data, id, {include: ['givenname', 'GENDER', 'AdDRess.CIty']}) as OpraUpdateQuery;
      expect(query.include).toStrictEqual(['givenName', 'gender', 'address.city']);
      query = OpraQuery.forUpdate(resource, data, id, {include: ['address', 'address.city']});
      expect(query.include).toStrictEqual(['address']);
      query = OpraQuery.forUpdate(resource, data, id, {include: ['address.city', 'address']});
      expect(query.include).toStrictEqual(['address']);
    })
  });


  describe('forUpdateMany()', function () {
    const data = {name: 'x'};
    it('Should create UpdateManyQuery', async () => {
      const resource = service.getEntityResource('Customers');
      const query = OpraQuery.forUpdateMany(resource, data, {filter: 'id=1'}) as OpraUpdateManyQuery;
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.queryType).toStrictEqual('updateMany');
      expect(query.operation).toStrictEqual('update');
      expect(query.scope).toStrictEqual('collection');
      expect(query.data).toStrictEqual(data);
      expect(query.filter).toStrictEqual('id=1');
    })
  });


  describe('forDelete()', function () {
    const id = 123;
    it('Should create DeleteQuery', async () => {
      const resource = service.getEntityResource('Customers');
      const query = OpraQuery.forDelete(resource, id) as OpraDeleteQuery;
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.queryType).toStrictEqual('delete');
      expect(query.operation).toStrictEqual('delete');
      expect(query.scope).toStrictEqual('instance');
      expect(query.keyValue).toStrictEqual(id);
    })
  });

  describe('forDeleteMany()', function () {
    it('Should create DeleteManyQuery', async () => {
      const resource = service.getEntityResource('Customers');
      const query = OpraQuery.forDeleteMany(resource, {filter: 'id=1'}) as OpraDeleteManyQuery;
      expect(query).toBeDefined();
      expect(query.resource).toStrictEqual(resource);
      expect(query.queryType).toStrictEqual('deleteMany');
      expect(query.operation).toStrictEqual('delete');
      expect(query.scope).toStrictEqual('collection');
      expect(query.filter).toStrictEqual('id=1');
    })

  });

});
