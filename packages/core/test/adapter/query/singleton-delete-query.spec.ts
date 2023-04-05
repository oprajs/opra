import { ApiDocument, DocumentFactory, OpraSchema } from '@opra/common';
import { SingletonDeleteQuery } from '@opra/core';
import { BestCustomerResource } from '../../_support/test-app/resource/best-customer.resource.js';
import { CustomersResource } from '../../_support/test-app/resource/customers.resource.js';

describe('SingletonDeleteQuery', function () {
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
    const resource = api.getSingleton('BestCustomer');
    const query = new SingletonDeleteQuery(resource);
    expect(query.resource).toStrictEqual(resource);
    expect(query.method).toStrictEqual('delete');
    expect(query.operation).toStrictEqual('delete');
    expect(query.type).toBe(api.getDataType('Customer'));
  })

});
