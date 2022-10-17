import { OpraApi, OpraDeleteInstanceQuery } from '@opra/schema';
import { CustomerNotesResource } from '../../_support/app-sqb/resources/customer-notes.resource.js';
import { CustomersResource } from '../../_support/app-sqb/resources/customers.resource.js';

describe('DeleteInstanceQuery', function () {
  let api: OpraApi;

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
    const resource = api.getEntityResource('Customers');
    const query = new OpraDeleteInstanceQuery(resource, 1);
    expect(query.resource).toStrictEqual(resource);
    expect(query.method).toStrictEqual('delete');
    expect(query.operation).toStrictEqual('delete');
    expect(query.scope).toStrictEqual('instance');
    expect(query.dataType).toBe(api.getDataType('Customer'));
    expect(query.keyValue).toStrictEqual(1);
  })

});
