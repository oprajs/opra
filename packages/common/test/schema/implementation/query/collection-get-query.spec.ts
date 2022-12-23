import { CollectionGetQuery, OpraDocument } from '../../../../src/index.js';
import { CustomerNotesResource } from '../../_support/app-sqb/resources/customer-notes.resource.js';
import { CustomersResource } from '../../_support/app-sqb/resources/customers.resource.js';

describe('CollectionGetQuery', function () {
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
    const query = new CollectionGetQuery(resource, 1);
    expect(query.resource).toStrictEqual(resource);
    expect(query.method).toStrictEqual('get');
    expect(query.operation).toStrictEqual('read');
    expect(query.dataType).toBe(api.getDataType('Customer'));
    expect(query.keyValue).toStrictEqual(1);
  })

  it('Should create query with "pick" option', async () => {
    const resource = api.getCollectionResource('Customers');
    const query = new CollectionGetQuery(resource, 1, {pick: ['address.city']});
    expect(query.keyValue).toStrictEqual(1);
    expect(query.pick).toStrictEqual(['address.city']);
  })

  it('Should normalize field names in "pick" option', async () => {
    const resource = api.getCollectionResource('Customers');
    let query = new CollectionGetQuery(resource, 1, {pick: ['givenname', 'GENDER', 'AdDRess.CIty']});
    expect(query.pick).toStrictEqual(['givenName', 'gender', 'address.city']);
    query = new CollectionGetQuery(resource, 1, {pick: ['address', 'address.city']});
    expect(query.pick).toStrictEqual(['address']);
    query = new CollectionGetQuery(resource, 1, {pick: ['address.city', 'address']});
    expect(query.pick).toStrictEqual(['address']);
  })

  it('Should validate if fields in "pick" option are exist', async () => {
    const resource = api.getCollectionResource('Customers');
    expect(() => new CollectionGetQuery(resource, 1, {pick: ['address.xid']}))
        .toThrow('Unknown field "address.xid"');
  })

  it('Should allow unknown fields in "pick" option if additionalFields set to "true"', async () => {
    const resource = api.getCollectionResource('Customers');
    const query = new CollectionGetQuery(resource, 1, {pick: ['notes.add1', 'notes.add2.add3']});
    expect(query.pick).toStrictEqual(['notes.add1', 'notes.add2.add3']);
  })

  it('Should create query with "omit" option', async () => {
    const resource = api.getCollectionResource('Customers');
    const query = new CollectionGetQuery(resource, 1, {omit: ['address.city']});
    expect(query.omit).toStrictEqual(['address.city']);
  })

  it('Should normalize field names in "omit" option', async () => {
    const resource = api.getCollectionResource('Customers');
    let query = new CollectionGetQuery(resource, 1, {omit: ['givenname', 'GENDER', 'AdDRess.CIty']});
    expect(query.omit).toStrictEqual(['givenName', 'gender', 'address.city']);
    query = new CollectionGetQuery(resource, 1, {omit: ['address', 'address.city']});
    expect(query.omit).toStrictEqual(['address']);
    query = new CollectionGetQuery(resource, 1, {omit: ['address.city', 'address']});
    expect(query.omit).toStrictEqual(['address']);
  })

  it('Should validate if fields in "omit" option are exist', async () => {
    const resource = api.getCollectionResource('Customers');
    expect(() => new CollectionGetQuery(resource, 1, {omit: ['address.xid']}))
        .toThrow('Unknown field "address.xid"');
  })

  it('Should allow unknown fields in "omit" option if additionalFields set to "true"', async () => {
    const resource = api.getCollectionResource('Customers');
    const query = new CollectionGetQuery(resource, 1, {omit: ['notes.add1', 'notes.add2.add3']});
    expect(query.omit).toStrictEqual(['notes.add1', 'notes.add2.add3']);
  })

  it('Should create query with "include" option', async () => {
    const resource = api.getCollectionResource('Customers');
    const query = new CollectionGetQuery(resource, 1, {include: ['address.city']});
    expect(query.include).toStrictEqual(['address.city']);
  })

  it('Should normalize field names in "include" option', async () => {
    const resource = api.getCollectionResource('Customers');
    let query = new CollectionGetQuery(resource, 1, {include: ['givenname', 'GENDER', 'AdDRess.CIty']});
    expect(query.include).toStrictEqual(['givenName', 'gender', 'address.city']);
    query = new CollectionGetQuery(resource, 1, {include: ['address', 'address.city']});
    expect(query.include).toStrictEqual(['address']);
    query = new CollectionGetQuery(resource, 1, {include: ['address.city', 'address']});
    expect(query.include).toStrictEqual(['address']);
  })

  it('Should validate if fields in "include" option are exist', async () => {
    const resource = api.getCollectionResource('Customers');
    expect(() => new CollectionGetQuery(resource, 1, {include: ['address.xid']}))
        .toThrow('Unknown field "address.xid"');
  })

  it('Should allow unknown fields in "include" option if additionalFields set to "true"', async () => {
    const resource = api.getCollectionResource('Customers');
    const query = new CollectionGetQuery(resource, 1, {include: ['notes.add1', 'notes.add2.add3']});
    expect(query.include).toStrictEqual(['notes.add1', 'notes.add2.add3']);
  })

});
