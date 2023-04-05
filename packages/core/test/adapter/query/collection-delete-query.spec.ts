import { ApiDocument, DocumentFactory, OpraSchema } from '@opra/common';
import { CollectionDeleteQuery } from '@opra/core';
import { BestCustomerResource } from '../../_support/test-app/resource/best-customer.resource.js';
import { CustomersResource } from '../../_support/test-app/resource/customers.resource.js';

describe('CollectionDeleteQuery', function () {
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
    const query = new CollectionDeleteQuery(resource, 1);
    expect(query.resource).toStrictEqual(resource);
    expect(query.method).toStrictEqual('delete');
    expect(query.operation).toStrictEqual('delete');
    expect(query.type).toBe(api.getDataType('Customer'));
    expect(query.keyValue).toStrictEqual(1);
  })

});
