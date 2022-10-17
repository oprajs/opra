import { OpraApi, OpraCreateInstanceQuery } from '@opra/schema';
import { CustomerNotesResource } from '../../_support/app-sqb/resources/customer-notes.resource.js';
import { CustomersResource } from '../../_support/app-sqb/resources/customers.resource.js';

describe('CreateInstanceQuery', function () {
  let api: OpraApi;
  const data = {givenName: 'john'};

  beforeAll(async () => {
    api = await OpraApi.create({
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
    const query = new OpraCreateInstanceQuery(resource, data);
    expect(query.resource).toStrictEqual(resource);
    expect(query.method).toStrictEqual('create');
    expect(query.operation).toStrictEqual('create');
    expect(query.scope).toStrictEqual('collection');
    expect(query.dataType).toBe(api.getDataType('Customer'));
    expect(query.data).toStrictEqual(data);
  })


  it('Should create query with "pick" option', async () => {
    const resource = api.getCollectionResource('Customers');
    const query = new OpraCreateInstanceQuery(resource, data, {pick: ['address.city']});
    expect(query.pick).toStrictEqual(['address.city']);
  })

  it('Should normalize field names in "pick" option', async () => {
    const resource = api.getCollectionResource('Customers');
    let query = new OpraCreateInstanceQuery(resource, data, {pick: ['givenname', 'GENDER', 'AdDRess.CIty']});
    expect(query.pick).toStrictEqual(['givenName', 'gender', 'address.city']);
    query = new OpraCreateInstanceQuery(resource, data, {pick: ['address', 'address.city']});
    expect(query.pick).toStrictEqual(['address']);
    query = new OpraCreateInstanceQuery(resource, data, {pick: ['address.city', 'address']});
    expect(query.pick).toStrictEqual(['address']);
  })

  it('Should validate if fields in "pick" option are exist', async () => {
    const resource = api.getCollectionResource('Customers');
    expect(() => new OpraCreateInstanceQuery(resource, data, {pick: ['address.xid']}))
        .toThrow('Unknown field "address.xid"');
  })

  it('Should allow unknown fields in "pick" option if additionalFields set to "true"', async () => {
    const resource = api.getCollectionResource('Customers');
    const query = new OpraCreateInstanceQuery(resource, data, {pick: ['notes.add1', 'notes.add2.add3']});
    expect(query.pick).toStrictEqual(['notes.add1', 'notes.add2.add3']);
  })

  it('Should create query with "omit" option', async () => {
    const resource = api.getCollectionResource('Customers');
    const query = new OpraCreateInstanceQuery(resource, data, {omit: ['address.city']});
    expect(query.omit).toStrictEqual(['address.city']);
  })

  it('Should normalize field names in "omit" option', async () => {
    const resource = api.getCollectionResource('Customers');
    let query = new OpraCreateInstanceQuery(resource, data, {omit: ['givenname', 'GENDER', 'AdDRess.CIty']});
    expect(query.omit).toStrictEqual(['givenName', 'gender', 'address.city']);
    query = new OpraCreateInstanceQuery(resource, data, {omit: ['address', 'address.city']});
    expect(query.omit).toStrictEqual(['address']);
    query = new OpraCreateInstanceQuery(resource, data, {omit: ['address.city', 'address']});
    expect(query.omit).toStrictEqual(['address']);
  })

  it('Should validate if fields in "omit" option are exist', async () => {
    const resource = api.getCollectionResource('Customers');
    expect(() => new OpraCreateInstanceQuery(resource, data, {omit: ['address.xid']}))
        .toThrow('Unknown field "address.xid"');
  })

  it('Should allow unknown fields in "omit" option if additionalFields set to "true"', async () => {
    const resource = api.getCollectionResource('Customers');
    const query = new OpraCreateInstanceQuery(resource, data, {omit: ['notes.add1', 'notes.add2.add3']});
    expect(query.omit).toStrictEqual(['notes.add1', 'notes.add2.add3']);
  })

  it('Should create query with "include" option', async () => {
    const resource = api.getCollectionResource('Customers');
    const query = new OpraCreateInstanceQuery(resource, data, {include: ['address.city']});
    expect(query.include).toStrictEqual(['address.city']);
  })

  it('Should normalize field names in "include" option', async () => {
    const resource = api.getCollectionResource('Customers');
    let query = new OpraCreateInstanceQuery(resource, data, {include: ['givenname', 'GENDER', 'AdDRess.CIty']});
    expect(query.include).toStrictEqual(['givenName', 'gender', 'address.city']);
    query = new OpraCreateInstanceQuery(resource, data, {include: ['address', 'address.city']});
    expect(query.include).toStrictEqual(['address']);
    query = new OpraCreateInstanceQuery(resource, data, {include: ['address.city', 'address']});
    expect(query.include).toStrictEqual(['address']);
  })

  it('Should validate if fields in "include" option are exist', async () => {
    const resource = api.getCollectionResource('Customers');
    expect(() => new OpraCreateInstanceQuery(resource, data, {include: ['address.xid']}))
        .toThrow('Unknown field "address.xid"');
  })

  it('Should allow unknown fields in "include" option if additionalFields set to "true"', async () => {
    const resource = api.getCollectionResource('Customers');
    const query = new OpraCreateInstanceQuery(resource, data, {include: ['notes.add1', 'notes.add2.add3']});
    expect(query.include).toStrictEqual(['notes.add1', 'notes.add2.add3']);
  })

});
