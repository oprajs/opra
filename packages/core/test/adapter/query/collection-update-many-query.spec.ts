import { ApiDocument, DocumentFactory, OpraSchema, parseFilter } from '@opra/common';
import { CollectionUpdateManyQuery } from '@opra/core';
import { BestCustomerResource } from '../../_support/test-app/resource/best-customer.resource.js';
import { CustomersResource } from '../../_support/test-app/resource/customers.resource.js';

describe('CollectionUpdateManyQuery', function () {
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
    const query = new CollectionUpdateManyQuery(resource, data);
    expect(query.resource).toStrictEqual(resource);
    expect(query.method).toStrictEqual('updateMany');
    expect(query.operation).toStrictEqual('update');
    expect(query.type).toBe(api.getDataType('Customer'));
    expect(query.data).toStrictEqual(data);
  })

  it('Should create query with "filter" option (string)', async () => {
    const resource = api.getCollection('Customers');
    const query = new CollectionUpdateManyQuery(resource, data, {filter: 'id=1'});
    expect(query.filter).toBeDefined();
    expect(typeof query.filter).toStrictEqual('object');
    expect(query.filter?.kind).toStrictEqual('ComparisonExpression');
  })

  it('Should create query with "filter" option (Expression)', async () => {
    const resource = api.getCollection('Customers');
    const query = new CollectionUpdateManyQuery(resource, data, {filter: parseFilter('address.code=1')});
    expect(query.filter).toBeDefined();
    expect(typeof query.filter).toStrictEqual('object');
    expect(query.filter?.kind).toStrictEqual('ComparisonExpression');
  })

});
