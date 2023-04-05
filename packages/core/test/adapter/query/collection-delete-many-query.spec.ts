import { ApiDocument, DocumentFactory, OpraSchema, parseFilter } from '@opra/common';
import { CollectionDeleteManyQuery } from '@opra/core';
import { BestCustomerResource } from '../../_support/test-app/resource/best-customer.resource.js';
import { CustomersResource } from '../../_support/test-app/resource/customers.resource.js';

describe('CollectionDeleteManyQuery', function () {
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
    const query = new CollectionDeleteManyQuery(resource);
    expect(query.resource).toStrictEqual(resource);
    expect(query.method).toStrictEqual('deleteMany');
    expect(query.operation).toStrictEqual('delete');
    expect(query.type).toBe(api.getDataType('Customer'));
  })

  it('Should create query with "filter" option (string)', async () => {
    const resource = api.getCollection('Customers');
    const query = new CollectionDeleteManyQuery(resource, {filter: 'id=1'});
    expect(query.filter).toBeDefined();
    expect(typeof query.filter).toStrictEqual('object');
    expect(query.filter?.kind).toStrictEqual('ComparisonExpression');
  })

  it('Should create query with "filter" option (Expression)', async () => {
    const resource = api.getCollection('Customers');
    const query = new CollectionDeleteManyQuery(resource, {filter: parseFilter('address.code=1')});
    expect(query.filter).toBeDefined();
    expect(typeof query.filter).toStrictEqual('object');
    expect(query.filter?.kind).toStrictEqual('ComparisonExpression');
  })


});
