import { ApiDocument, DocumentFactory, OpraSchema } from '@opra/common';
import { CollectionCreateQuery } from '@opra/core';
import { BestCustomerResource } from '../../_support/test-app/resource/best-customer.resource.js';
import { CustomersResource } from '../../_support/test-app/resource/customers.resource.js';

describe('CollectionCreateQuery', function () {
  let api: ApiDocument;
  const data = {givenName: 'john'};

  beforeAll(async () => {
    api = await DocumentFactory.createDocument({
      version: OpraSchema.SpecVersion,
      info: {
        title: 'TestApi',
        version: 'v1',
      },
      types: [],
      resources: [CustomersResource, BestCustomerResource]
    });
  });

  it('Should create query', async () => {
    const resource = api.getCollection('Customers');
    const query = new CollectionCreateQuery(resource, data);
    expect(query.resource).toStrictEqual(resource);
    expect(query.method).toStrictEqual('create');
    expect(query.operation).toStrictEqual('create');
    expect(query.type).toBe(api.getDataType('Customer'));
    expect(query.data).toStrictEqual(data);
  })


  it('Should create query with "pick" option', async () => {
    const resource = api.getCollection('Customers');
    const query = new CollectionCreateQuery(resource, data, {pick: ['address.city']});
    expect(query.pick).toStrictEqual(['address.city']);
  })

  it('Should normalize field names in "pick" option', async () => {
    const resource = api.getCollection('Customers');
    let query = new CollectionCreateQuery(resource, data, {pick: ['givenname', 'GENDER', 'AdDRess.CIty']});
    expect(query.pick).toStrictEqual(['givenName', 'gender', 'address.city']);
    query = new CollectionCreateQuery(resource, data, {pick: ['address', 'address.city']});
    expect(query.pick).toStrictEqual(['address']);
    query = new CollectionCreateQuery(resource, data, {pick: ['address.city', 'address']});
    expect(query.pick).toStrictEqual(['address']);
  })

  it('Should validate if fields in "pick" option are exist', async () => {
    const resource = api.getCollection('Customers');
    expect(() => new CollectionCreateQuery(resource, data, {pick: ['address.xid']}))
        .toThrow('Unknown element "address.xid"');
  })

  it('Should allow unknown fields in "pick" option if additionalFields set to "true"', async () => {
    const resource = api.getCollection('Customers');
    const query = new CollectionCreateQuery(resource, data, {pick: ['notes.add1', 'notes.add2.add3']});
    expect(query.pick).toStrictEqual(['notes.add1', 'notes.add2.add3']);
  })

  it('Should create query with "omit" option', async () => {
    const resource = api.getCollection('Customers');
    const query = new CollectionCreateQuery(resource, data, {omit: ['address.city']});
    expect(query.omit).toStrictEqual(['address.city']);
  })

  it('Should normalize field names in "omit" option', async () => {
    const resource = api.getCollection('Customers');
    let query = new CollectionCreateQuery(resource, data, {omit: ['givenname', 'GENDER', 'AdDRess.CIty']});
    expect(query.omit).toStrictEqual(['givenName', 'gender', 'address.city']);
    query = new CollectionCreateQuery(resource, data, {omit: ['address', 'address.city']});
    expect(query.omit).toStrictEqual(['address']);
    query = new CollectionCreateQuery(resource, data, {omit: ['address.city', 'address']});
    expect(query.omit).toStrictEqual(['address']);
  })

  it('Should validate if fields in "omit" option are exist', async () => {
    const resource = api.getCollection('Customers');
    expect(() => new CollectionCreateQuery(resource, data, {omit: ['address.xid']}))
        .toThrow('Unknown element "address.xid"');
  })

  it('Should allow unknown fields in "omit" option if additionalFields set to "true"', async () => {
    const resource = api.getCollection('Customers');
    const query = new CollectionCreateQuery(resource, data, {omit: ['notes.add1', 'notes.add2.add3']});
    expect(query.omit).toStrictEqual(['notes.add1', 'notes.add2.add3']);
  })

  it('Should create query with "include" option', async () => {
    const resource = api.getCollection('Customers');
    const query = new CollectionCreateQuery(resource, data, {include: ['address.city']});
    expect(query.include).toStrictEqual(['address.city']);
  })

  it('Should normalize field names in "include" option', async () => {
    const resource = api.getCollection('Customers');
    let query = new CollectionCreateQuery(resource, data, {include: ['givenname', 'GENDER', 'AdDRess.CIty']});
    expect(query.include).toStrictEqual(['givenName', 'gender', 'address.city']);
    query = new CollectionCreateQuery(resource, data, {include: ['address', 'address.city']});
    expect(query.include).toStrictEqual(['address']);
    query = new CollectionCreateQuery(resource, data, {include: ['address.city', 'address']});
    expect(query.include).toStrictEqual(['address']);
  })

  it('Should validate if fields in "include" option are exist', async () => {
    const resource = api.getCollection('Customers');
    expect(() => new CollectionCreateQuery(resource, data, {include: ['address.xid']}))
        .toThrow('Unknown element "address.xid"');
  })

  it('Should allow unknown fields in "include" option if additionalFields set to "true"', async () => {
    const resource = api.getCollection('Customers');
    const query = new CollectionCreateQuery(resource, data, {include: ['notes.add1', 'notes.add2.add3']});
    expect(query.include).toStrictEqual(['notes.add1', 'notes.add2.add3']);
  })

});
