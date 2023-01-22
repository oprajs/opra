import { CollectionGetQuery, FieldGetQuery, OpraDocument } from '../../../../src/index.js';
import { CustomerNotesResource } from '../../_support/test-app/resources/customer-notes.resource.js';
import { CustomersResource } from '../../_support/test-app/resources/customers.resource.js';

describe('GetFieldQuery', function () {
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
    const parent = new CollectionGetQuery(resource, 1);
    const query = new FieldGetQuery(parent, 'address');
    expect(query.resource).toStrictEqual(resource);
    expect(query.method).toStrictEqual('get');
    expect(query.operation).toStrictEqual('read');
    expect(query.parent).toEqual(parent);
    expect(query.fieldName).toStrictEqual('address');
    expect(query.path).toStrictEqual('address');
    expect(typeof query.field).toStrictEqual('object');
    expect(query.field?.name).toStrictEqual('address');
    expect(query.dataType).toBe(api.getDataType('Address'));
    expect(query.parentType).toBe(api.getDataType('Customer'));

    const query2 = new FieldGetQuery(query, 'city');
    expect(query2.fieldName).toStrictEqual('city');
    expect(query2.path).toStrictEqual('address.city');
    expect(query2.dataType).toBe(api.getDataType('string'));
    expect(query2.parentType).toBe(api.getDataType('Address'));
  })

  it('Should create query with "pick" option', async () => {
    const resource = api.getCollectionResource('Customers');
    const parent = new CollectionGetQuery(resource, 1);
    const query = new FieldGetQuery(parent, 'address', {pick: ['city']});
    expect(query.pick).toStrictEqual(['city']);
  })

  it('Should normalize field names in "pick" option', async () => {
    const resource = api.getCollectionResource('Customers');
    const parent = new CollectionGetQuery(resource, 1);
    const query = new FieldGetQuery(parent, 'address', {pick: ['City']});
    expect(query.pick).toStrictEqual(['city']);
  })

  it('Should validate if fields in "pick" option are exist', async () => {
    const resource = api.getCollectionResource('Customers');
    const parent = new CollectionGetQuery(resource, 1);
    expect(() => new FieldGetQuery(parent, 'address', {pick: ['xCity']}))
        .toThrow('Unknown field "xCity"');
  })

  it('Should allow unknown fields in "pick" option if additionalFields set to "true"', async () => {
    const resource = api.getCollectionResource('Customers');
    const parent = new CollectionGetQuery(resource, 1);
    const query = new FieldGetQuery(parent, 'notes', {pick: ['add1', 'add2.add3']});
    expect(query.pick).toStrictEqual(['add1', 'add2.add3']);
  })

  it('Should create query with "omit" option', async () => {
    const resource = api.getCollectionResource('Customers');
    const parent = new CollectionGetQuery(resource, 1);
    const query = new FieldGetQuery(parent, 'address', {omit: ['city']});
    expect(query.omit).toStrictEqual(['city']);
  })

  it('Should normalize field names in "omit" option', async () => {
    const resource = api.getCollectionResource('Customers');
    const parent = new CollectionGetQuery(resource, 1);
    const query = new FieldGetQuery(parent, 'address', {omit: ['City']});
    expect(query.omit).toStrictEqual(['city']);
  })

  it('Should validate if fields in "omit" option are exist', async () => {
    const resource = api.getCollectionResource('Customers');
    const parent = new CollectionGetQuery(resource, 1);
    expect(() => new FieldGetQuery(parent, 'address', {omit: ['xCity']}))
        .toThrow('Unknown field "xCity"');
  })

  it('Should allow unknown fields in "omit" option if additionalFields set to "true"', async () => {
    const resource = api.getCollectionResource('Customers');
    const parent = new CollectionGetQuery(resource, 1);
    const query = new FieldGetQuery(parent, 'notes', {omit: ['add1', 'add2.add3']});
    expect(query.omit).toStrictEqual(['add1', 'add2.add3']);
  })

  it('Should create query with "include" option', async () => {
    const resource = api.getCollectionResource('Customers');
    const parent = new CollectionGetQuery(resource, 1);
    const query = new FieldGetQuery(parent, 'address', {include: ['city']});
    expect(query.include).toStrictEqual(['city']);
  })

  it('Should normalize field names in "include" option', async () => {
    const resource = api.getCollectionResource('Customers');
    const parent = new CollectionGetQuery(resource, 1);
    const query = new FieldGetQuery(parent, 'address', {include: ['City']});
    expect(query.include).toStrictEqual(['city']);
  })

  it('Should validate if fields in "include" option are exist', async () => {
    const resource = api.getCollectionResource('Customers');
    const parent = new CollectionGetQuery(resource, 1);
    expect(() => new FieldGetQuery(parent, 'address', {include: ['xCity']}))
        .toThrow('Unknown field "xCity"');
  })

  it('Should allow unknown fields in "include" option if additionalFields set to "true"', async () => {
    const resource = api.getCollectionResource('Customers');
    const parent = new CollectionGetQuery(resource, 1);
    const query = new FieldGetQuery(parent, 'notes', {include: ['add1', 'add2.add3']});
    expect(query.include).toStrictEqual(['add1', 'add2.add3']);
  })

});
