import { CollectionSearchQuery, OpraDocument, parseFilter } from '../../../../src/index.js';
import { CustomerNotesResource } from '../../_support/test-app/resources/customer-notes.resource.js';
import { CustomersResource } from '../../_support/test-app/resources/customers.resource.js';

describe('CollectionSearchQuery', function () {
  let api: OpraDocument;

  beforeAll(async () => {
    api = await OpraDocument.create({
      info: {
        title: 'TestApi',
        version: 'v1',
      },
      types: [],
      resources: [new CustomersResource(), new CustomerNotesResource()]
    });
  });

  it('Should create query', async () => {
    const resource = api.getCollectionResource('Customers');
    const query = new CollectionSearchQuery(resource);
    expect(query.resource).toStrictEqual(resource);
    expect(query.method).toStrictEqual('search');
    expect(query.operation).toStrictEqual('read');
    expect(query.dataType).toBe(api.getDataType('Customer'));
  })

  it('Should create query with "limit" option', async () => {
    const resource = api.getCollectionResource('Customers');
    const query = new CollectionSearchQuery(resource, {limit: 1});
    expect(query.limit).toStrictEqual(1);
  })

  it('Should create query with "skip" option', async () => {
    const resource = api.getCollectionResource('Customers');
    const query = new CollectionSearchQuery(resource, {skip: 1});
    expect(query.skip).toStrictEqual(1);
  })

  it('Should create query with "count" option', async () => {
    const resource = api.getCollectionResource('Customers');
    const query = new CollectionSearchQuery(resource, {count: false});
    expect(query.count).toStrictEqual(false);
  })

  it('Should create query with "distinct" option', async () => {
    const resource = api.getCollectionResource('Customers');
    const query = new CollectionSearchQuery(resource, {distinct: false});
    expect(query.distinct).toStrictEqual(false);
  })

  it('Should create query with "filter" option (string)', async () => {
    const resource = api.getCollectionResource('Customers');
    const query = new CollectionSearchQuery(resource, {filter: 'id=1'});
    expect(query.filter).toBeDefined();
    expect(typeof query.filter).toStrictEqual('object');
    expect(query.filter?.kind).toStrictEqual('ComparisonExpression');
  })

  it('Should create query with "filter" option (Expression)', async () => {
    const resource = api.getCollectionResource('Customers');
    const query = new CollectionSearchQuery(resource, {filter: parseFilter('address.code=1')});
    expect(query.filter).toBeDefined();
    expect(typeof query.filter).toStrictEqual('object');
    expect(query.filter?.kind).toStrictEqual('ComparisonExpression');
  })

  it('Should create query with "pick" option', async () => {
    const resource = api.getCollectionResource('Customers');
    const query = new CollectionSearchQuery(resource, {pick: ['address.city']});
    expect(query.pick).toStrictEqual(['address.city']);
  })

  it('Should normalize field names in "pick" option', async () => {
    const resource = api.getCollectionResource('Customers');
    let query = new CollectionSearchQuery(resource, {pick: ['givenname', 'GENDER', 'AdDRess.CIty']});
    expect(query.pick).toStrictEqual(['givenName', 'gender', 'address.city']);
    query = new CollectionSearchQuery(resource, {pick: ['address', 'address.city']});
    expect(query.pick).toStrictEqual(['address']);
    query = new CollectionSearchQuery(resource, {pick: ['address.city', 'address']});
    expect(query.pick).toStrictEqual(['address']);
  })

  it('Should validate if fields in "pick" option are exist', async () => {
    const resource = api.getCollectionResource('Customers');
    expect(() => new CollectionSearchQuery(resource, {pick: ['address.xid']}))
        .toThrow('Unknown field "address.xid"');
  })

  it('Should allow unknown fields in "pick" option if additionalFields set to "true"', async () => {
    const resource = api.getCollectionResource('Customers');
    const query = new CollectionSearchQuery(resource, {pick: ['notes.add1', 'notes.add2.add3']});
    expect(query.pick).toStrictEqual(['notes.add1', 'notes.add2.add3']);
  })

  it('Should create query with "omit" option', async () => {
    const resource = api.getCollectionResource('Customers');
    const query = new CollectionSearchQuery(resource, {omit: ['address.city']});
    expect(query.omit).toStrictEqual(['address.city']);
  })

  it('Should normalize field names in "omit" option', async () => {
    const resource = api.getCollectionResource('Customers');
    let query = new CollectionSearchQuery(resource, {omit: ['givenname', 'GENDER', 'AdDRess.CIty']});
    expect(query.omit).toStrictEqual(['givenName', 'gender', 'address.city']);
    query = new CollectionSearchQuery(resource, {omit: ['address', 'address.city']});
    expect(query.omit).toStrictEqual(['address']);
    query = new CollectionSearchQuery(resource, {omit: ['address.city', 'address']});
    expect(query.omit).toStrictEqual(['address']);
  })

  it('Should validate if fields in "omit" option are exist', async () => {
    const resource = api.getCollectionResource('Customers');
    expect(() => new CollectionSearchQuery(resource, {omit: ['address.xid']}))
        .toThrow('Unknown field "address.xid"');
  })

  it('Should allow unknown fields in "omit" option if additionalFields set to "true"', async () => {
    const resource = api.getCollectionResource('Customers');
    const query = new CollectionSearchQuery(resource, {omit: ['notes.add1', 'notes.add2.add3']});
    expect(query.omit).toStrictEqual(['notes.add1', 'notes.add2.add3']);
  })

  it('Should create query with "include" option', async () => {
    const resource = api.getCollectionResource('Customers');
    const query = new CollectionSearchQuery(resource, {include: ['address.city']});
    expect(query.include).toStrictEqual(['address.city']);
  })

  it('Should normalize field names in "include" option', async () => {
    const resource = api.getCollectionResource('Customers');
    let query = new CollectionSearchQuery(resource, {include: ['givenname', 'GENDER', 'AdDRess.CIty']});
    expect(query.include).toStrictEqual(['givenName', 'gender', 'address.city']);
    query = new CollectionSearchQuery(resource, {include: ['address', 'address.city']});
    expect(query.include).toStrictEqual(['address']);
    query = new CollectionSearchQuery(resource, {include: ['address.city', 'address']});
    expect(query.include).toStrictEqual(['address']);
  })

  it('Should validate if fields in "include" option are exist', async () => {
    const resource = api.getCollectionResource('Customers');
    expect(() => new CollectionSearchQuery(resource, {include: ['address.xid']}))
        .toThrow('Unknown field "address.xid"');
  })

  it('Should allow unknown fields in "include" option if additionalFields set to "true"', async () => {
    const resource = api.getCollectionResource('Customers');
    const query = new CollectionSearchQuery(resource, {include: ['notes.add1', 'notes.add2.add3']});
    expect(query.include).toStrictEqual(['notes.add1', 'notes.add2.add3']);
  })

  it('Should create query with "sort" option', async () => {
    const resource = api.getCollectionResource('Customers');
    const query = new CollectionSearchQuery(resource, {sort: ['address.city']});
    expect(query.sort).toStrictEqual(['address.city']);
  })

  it('Should normalize field names in "sort" option', async () => {
    const resource = api.getCollectionResource('Customers');
    const query = new CollectionSearchQuery(resource, {sort: ['givenname', 'GENDER', 'AdDRess.CIty']});
    expect(query.sort).toStrictEqual(['givenName', 'gender', 'address.city']);
  })

  it('Should validate if fields in "sort" option are exist', async () => {
    const resource = api.getCollectionResource('Customers');
    expect(() => new CollectionSearchQuery(resource, {sort: ['address.xid']}))
        .toThrow('Unknown field "address.xid"');
  })

  it('Should validate if field is available for sorting ', async () => {
    const resource = api.getCollectionResource('Customers');
    expect(() => new CollectionSearchQuery(resource, {sort: ['cid']}))
        .toThrow(`Field 'cid' is not available for sort operation`);
  })

});
