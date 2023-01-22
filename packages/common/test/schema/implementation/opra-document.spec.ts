import { CollectionResourceInfo, OpraDocument, OpraSchema } from '../../../src/index.js';
import {
  BestCustomerResource,
  Country,
  Customer,
  CustomerNotes,
  CustomersResource
} from '../_support/test-app/index.js';

describe('OpraDocument', function () {

  const baseArgs: OpraSchema.Document = {
    version: OpraSchema.Version,
    info: {
      title: 'TestDocument',
      version: 'v1',
      description: 'Test api description',
    },
    servers: [{
      url: 'http://tempure.org'
    }]
  };

  it('Should construct', async () => {
    const doc = new OpraDocument(baseArgs);
    expect(doc).toBeInstanceOf(OpraDocument);
    expect(doc.info).toStrictEqual(baseArgs.info);
    expect(doc.servers).toStrictEqual(baseArgs.servers);
  })

  it('Should create async', async () => {
    const doc = await OpraDocument.create(baseArgs);
    expect(doc).toBeInstanceOf(OpraDocument);
    expect(doc.info).toStrictEqual(baseArgs.info);
    expect(doc.servers).toStrictEqual(baseArgs.servers);
  })

  it('Should add data types', async () => {
    const doc = await OpraDocument.create({
      ...baseArgs,
      types: [Customer, CustomerNotes, Country]
    });
    expect(doc.getDataType('Customer')).toBeDefined();
    const customerType = doc.getDataType('customer');
    expect(customerType).toBeDefined();
    expect(customerType.kind).toStrictEqual('ComplexType');
    expect(customerType.name).toStrictEqual('Customer');
  })

  it('Should automatically add extending data types', async () => {
    const doc = await OpraDocument.create({
      ...baseArgs,
      types: [Customer, CustomerNotes, Country]
    });
    expect(() => doc.getDataType('record')).not.toThrow();
    const t = doc.getDataType('record');
    expect(t.kind).toStrictEqual('ComplexType');
    expect(t.name).toStrictEqual('Record');
  })

  it('Should validate if extending data type exists', async () => {
    await expect(() => OpraDocument.create({
      ...baseArgs,
      types: {
        type1: {
          kind: 'ComplexType',
          extends: [{type: 'UndefinedType'}]
        }
      }
    })).rejects.toThrow('does not exists');
  })

  it('Should verify whether th types in the fields exist', async () => {
    await expect(() => OpraDocument.create({
      ...baseArgs,
      types: {
        type1: {
          kind: 'ComplexType',
          fields: {id: {type: 'UndefinedType'}}
        }
      }
    })).rejects.toThrow('does not exists');
  })

  it('Should getDataType() make a case insensitive lookup', async () => {
    const doc = await OpraDocument.create({
      ...baseArgs,
      types: [Customer, CustomerNotes, Country]
    });
    expect(() => doc.getDataType('Customer')).not.toThrow();
    expect(doc.getDataType('Customer')).toBeDefined();
    expect(() => doc.getDataType('customer')).not.toThrow();
    expect(doc.getDataType('customer')).toBeDefined();
  })

  it('Should getDataType() throw error if data type does not exists', async () => {
    const doc = await OpraDocument.create({
      ...baseArgs,
      types: [Customer, CustomerNotes, Country]
    });
    expect(() => doc.getDataType('notexistsresource')).toThrow('does not exists');
  })

  it('Should add resources by schema object', async () => {
    const customers: OpraSchema.CollectionResource = {
      kind: 'CollectionResource',
      type: 'Customer',
      keyFields: 'id',
      get: {},
      search: {},
    };
    const bestCustomer: OpraSchema.SingletonResource = {
      kind: 'SingletonResource',
      type: 'Customer',
      get: {}
    }
    const doc = await OpraDocument.create({
      ...baseArgs,
      types: [Customer, CustomerNotes, Country],
      resources: {
        Customers: customers,
        BestCustomer: bestCustomer
      }
    });
    expect(doc.getResource('Customers')).toBeDefined();
    let resource = doc.getResource('customers');
    expect(resource).toBeDefined();
    expect(resource.name).toStrictEqual('Customers');
    expect(resource.kind).toStrictEqual('CollectionResource');
    resource = doc.getResource('bestcustomer');
    expect(resource).toBeDefined();
    expect(resource.name).toStrictEqual('BestCustomer');
    expect(resource.kind).toStrictEqual('SingletonResource');
  })

  it('Should add resources by decorated class instance', async () => {
    const doc = await OpraDocument.create({
      ...baseArgs,
      types: [Customer, CustomerNotes, Country],
      resources: [new CustomersResource(), new BestCustomerResource()]
    });
    expect(doc.getResource('Customers')).toBeDefined();
    let resource = doc.getResource('customers');
    expect(resource).toBeDefined();
    expect(resource.name).toStrictEqual('Customers');
    expect(resource.kind).toStrictEqual('CollectionResource');
    resource = doc.getResource('bestcustomer');
    expect(resource).toBeDefined();
    expect(resource.name).toStrictEqual('BestCustomer');
    expect(resource.kind).toStrictEqual('SingletonResource');
  })

  it('Should add resources by decorated class', async () => {
    const doc = await OpraDocument.create({
      ...baseArgs,
      types: [Customer, CustomerNotes, Country],
      resources: [CustomersResource, BestCustomerResource]
    });
    expect(doc.getResource('Customers')).toBeDefined();
    let resource = doc.getResource('customers');
    expect(resource).toBeDefined();
    expect(resource.name).toStrictEqual('Customers');
    expect(resource.kind).toStrictEqual('CollectionResource');
    resource = doc.getResource('bestcustomer');
    expect(resource).toBeDefined();
    expect(resource.name).toStrictEqual('BestCustomer');
    expect(resource.kind).toStrictEqual('SingletonResource');
  })

  it('Should automatically add data type while adding resource', async () => {
    const doc = await OpraDocument.create({
      ...baseArgs,
      resources: [CustomersResource, BestCustomerResource]
    });
    expect(() => doc.getDataType('Customer')).not.toThrow();
    expect(doc.getDataType('Customer')).toBeDefined();
  })

  it('Should getResource() make a case insensitive lookup', async () => {
    const doc = await OpraDocument.create({
      ...baseArgs,
      resources: [CustomersResource, BestCustomerResource]
    });
    expect(doc.getResource('Customers')).toBeInstanceOf(CollectionResourceInfo);
    expect(doc.getResource('customers')).toBeInstanceOf(CollectionResourceInfo);
  })

  it('Should getResource() throw error if resource does not exists', async () => {
    const doc = await OpraDocument.create({
      ...baseArgs,
      resources: [CustomersResource, BestCustomerResource]
    });
    expect(() => doc.getResource('notexistsresource')).toThrow('does not exists');
  })

});
