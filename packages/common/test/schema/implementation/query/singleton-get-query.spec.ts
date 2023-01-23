import { OpraDocument, SingletonGetQuery } from '../../../../src/index.js';
import { BestCustomerResource } from '../../_support/test-app/index.js';

describe('SingletonGetQuery', function () {
  let api: OpraDocument;

  beforeAll(async () => {
    api = await OpraDocument.create({
      info: {
        title: 'TestApi',
        version: 'v1',
      },
      types: [],
      resources: [new BestCustomerResource()]
    });
  });
  //
  it('Should create query', async () => {
    const resource = api.getSingletonResource('BestCustomer');
    const query = new SingletonGetQuery(resource);
    expect(query.resource).toStrictEqual(resource);
    expect(query.method).toStrictEqual('get');
    expect(query.operation).toStrictEqual('read');
    expect(query.dataType).toBe(api.getDataType('Customer'));
  })

  it('Should create query with "pick" option', async () => {
    const resource = api.getSingletonResource('BestCustomer');
    const query = new SingletonGetQuery(resource, {pick: ['address.city']});
    expect(query.pick).toStrictEqual(['address.city']);
  })

  it('Should normalize field names in "pick" option', async () => {
    const resource = api.getSingletonResource('BestCustomer');
    let query = new SingletonGetQuery(resource, {pick: ['givenname', 'GENDER', 'AdDRess.CIty']});
    expect(query.pick).toStrictEqual(['givenName', 'gender', 'address.city']);
    query = new SingletonGetQuery(resource, {pick: ['address', 'address.city']});
    expect(query.pick).toStrictEqual(['address']);
    query = new SingletonGetQuery(resource, {pick: ['address.city', 'address']});
    expect(query.pick).toStrictEqual(['address']);
  })

  it('Should validate if fields in "pick" option are exist', async () => {
    const resource = api.getSingletonResource('BestCustomer');
    expect(() => new SingletonGetQuery(resource, {pick: ['address.xid']}))
        .toThrow('Unknown field "address.xid"');
  })

  it('Should allow unknown fields in "pick" option if additionalFields set to "true"', async () => {
    const resource = api.getSingletonResource('BestCustomer');
    const query = new SingletonGetQuery(resource, {pick: ['notes.add1', 'notes.add2.add3']});
    expect(query.pick).toStrictEqual(['notes.add1', 'notes.add2.add3']);
  })

  it('Should create query with "omit" option', async () => {
    const resource = api.getSingletonResource('BestCustomer');
    const query = new SingletonGetQuery(resource, {omit: ['address.city']});
    expect(query.omit).toStrictEqual(['address.city']);
  })

  it('Should normalize field names in "omit" option', async () => {
    const resource = api.getSingletonResource('BestCustomer');
    let query = new SingletonGetQuery(resource, {omit: ['givenname', 'GENDER', 'AdDRess.CIty']});
    expect(query.omit).toStrictEqual(['givenName', 'gender', 'address.city']);
    query = new SingletonGetQuery(resource, {omit: ['address', 'address.city']});
    expect(query.omit).toStrictEqual(['address']);
    query = new SingletonGetQuery(resource, {omit: ['address.city', 'address']});
    expect(query.omit).toStrictEqual(['address']);
  })

  it('Should validate if fields in "omit" option are exist', async () => {
    const resource = api.getSingletonResource('BestCustomer');
    expect(() => new SingletonGetQuery(resource, {omit: ['address.xid']}))
        .toThrow('Unknown field "address.xid"');
  })

  it('Should allow unknown fields in "omit" option if additionalFields set to "true"', async () => {
    const resource = api.getSingletonResource('BestCustomer');
    const query = new SingletonGetQuery(resource, {omit: ['notes.add1', 'notes.add2.add3']});
    expect(query.omit).toStrictEqual(['notes.add1', 'notes.add2.add3']);
  })

  it('Should create query with "include" option', async () => {
    const resource = api.getSingletonResource('BestCustomer');
    const query = new SingletonGetQuery(resource, {include: ['address.city']});
    expect(query.include).toStrictEqual(['address.city']);
  })

  it('Should normalize field names in "include" option', async () => {
    const resource = api.getSingletonResource('BestCustomer');
    let query = new SingletonGetQuery(resource, {include: ['givenname', 'GENDER', 'AdDRess.CIty']});
    expect(query.include).toStrictEqual(['givenName', 'gender', 'address.city']);
    query = new SingletonGetQuery(resource, {include: ['address', 'address.city']});
    expect(query.include).toStrictEqual(['address']);
    query = new SingletonGetQuery(resource, {include: ['address.city', 'address']});
    expect(query.include).toStrictEqual(['address']);
  })

  it('Should validate if fields in "include" option are exist', async () => {
    const resource = api.getSingletonResource('BestCustomer');
    expect(() => new SingletonGetQuery(resource, {include: ['address.xid']}))
        .toThrow('Unknown field "address.xid"');
  })

  it('Should allow unknown fields in "include" option if additionalFields set to "true"', async () => {
    const resource = api.getSingletonResource('BestCustomer');
    const query = new SingletonGetQuery(resource, {include: ['notes.add1', 'notes.add2.add3']});
    expect(query.include).toStrictEqual(['notes.add1', 'notes.add2.add3']);
  })

});
