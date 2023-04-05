import { ApiDocument, DocumentFactory, OpraSchema } from '@opra/common';
import { CollectionGetQuery, ElementGetQuery } from '@opra/core';
import { BestCustomerResource } from '../../_support/test-app/resource/best-customer.resource.js';
import { CustomersResource } from '../../_support/test-app/resource/customers.resource.js';

describe('ElementReadQuery', function () {
  let api: ApiDocument;

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
    const parent = new CollectionGetQuery(resource, 1);
    const query = new ElementGetQuery(parent, 'address');
    expect(query.resource).toStrictEqual(resource);
    expect(query.method).toStrictEqual('get');
    expect(query.operation).toStrictEqual('read');
    expect(query.parent).toEqual(parent);
    expect(query.elementName).toStrictEqual('address');
    expect(query.path).toStrictEqual('address');
    expect(typeof query.element).toStrictEqual('object');
    expect(query.element?.name).toStrictEqual('address');
    expect(query.type).toBe(api.getDataType('Address'));
    expect(query.parentType).toBe(api.getDataType('Customer'));

    const query2 = new ElementGetQuery(query, 'city');
    expect(query2.elementName).toStrictEqual('city');
    expect(query2.path).toStrictEqual('address.city');
    expect(query2.type).toBe(api.getDataType('string'));
    expect(query2.parentType).toBe(api.getDataType('Address'));
  })

  it('Should create query with "pick" option', async () => {
    const resource = api.getCollection('Customers');
    const parent = new CollectionGetQuery(resource, 1);
    const query = new ElementGetQuery(parent, 'address', {pick: ['city']});
    expect(query.pick).toStrictEqual(['city']);
  })

  it('Should normalize field names in "pick" option', async () => {
    const resource = api.getCollection('Customers');
    const parent = new CollectionGetQuery(resource, 1);
    const query = new ElementGetQuery(parent, 'address', {pick: ['City']});
    expect(query.pick).toStrictEqual(['city']);
  })

  it('Should validate if fields in "pick" option are exist', async () => {
    const resource = api.getCollection('Customers');
    const parent = new CollectionGetQuery(resource, 1);
    expect(() => new ElementGetQuery(parent, 'address', {pick: ['xCity']}))
        .toThrow('Unknown element "xCity"');
  })

  it('Should allow unknown fields in "pick" option if additionalFields set to "true"', async () => {
    const resource = api.getCollection('Customers');
    const parent = new CollectionGetQuery(resource, 1);
    const query = new ElementGetQuery(parent, 'notes', {pick: ['add1', 'add2.add3']});
    expect(query.pick).toStrictEqual(['add1', 'add2.add3']);
  })

  it('Should create query with "omit" option', async () => {
    const resource = api.getCollection('Customers');
    const parent = new CollectionGetQuery(resource, 1);
    const query = new ElementGetQuery(parent, 'address', {omit: ['city']});
    expect(query.omit).toStrictEqual(['city']);
  })

  it('Should normalize field names in "omit" option', async () => {
    const resource = api.getCollection('Customers');
    const parent = new CollectionGetQuery(resource, 1);
    const query = new ElementGetQuery(parent, 'address', {omit: ['City']});
    expect(query.omit).toStrictEqual(['city']);
  })

  it('Should validate if fields in "omit" option are exist', async () => {
    const resource = api.getCollection('Customers');
    const parent = new CollectionGetQuery(resource, 1);
    expect(() => new ElementGetQuery(parent, 'address', {omit: ['xCity']}))
        .toThrow('Unknown element "xCity"');
  })

  it('Should allow unknown fields in "omit" option if additionalFields set to "true"', async () => {
    const resource = api.getCollection('Customers');
    const parent = new CollectionGetQuery(resource, 1);
    const query = new ElementGetQuery(parent, 'notes', {omit: ['add1', 'add2.add3']});
    expect(query.omit).toStrictEqual(['add1', 'add2.add3']);
  })

  it('Should create query with "include" option', async () => {
    const resource = api.getCollection('Customers');
    const parent = new CollectionGetQuery(resource, 1);
    const query = new ElementGetQuery(parent, 'address', {include: ['city']});
    expect(query.include).toStrictEqual(['city']);
  })

  it('Should normalize field names in "include" option', async () => {
    const resource = api.getCollection('Customers');
    const parent = new CollectionGetQuery(resource, 1);
    const query = new ElementGetQuery(parent, 'address', {include: ['City']});
    expect(query.include).toStrictEqual(['city']);
  })

  it('Should validate if fields in "include" option are exist', async () => {
    const resource = api.getCollection('Customers');
    const parent = new CollectionGetQuery(resource, 1);
    expect(() => new ElementGetQuery(parent, 'address', {include: ['xCity']}))
        .toThrow('Unknown element "xCity"');
  })

  it('Should allow unknown fields in "include" option if additionalFields set to "true"', async () => {
    const resource = api.getCollection('Customers');
    const parent = new CollectionGetQuery(resource, 1);
    const query = new ElementGetQuery(parent, 'notes', {include: ['add1', 'add2.add3']});
    expect(query.include).toStrictEqual(['add1', 'add2.add3']);
  })

});
