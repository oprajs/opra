import { OpraApi, OpraDeleteCollectionQuery } from '@opra/schema';
import { parseFilter } from '@opra/url';
import { CustomerNotesResource } from '../../_support/app-sqb/resources/customer-notes.resource.js';
import { CustomersResource } from '../../_support/app-sqb/resources/customers.resource.js';

describe('DeleteCollectionQuery', function () {
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
    const query = new OpraDeleteCollectionQuery(resource);
    expect(query.resource).toStrictEqual(resource);
    expect(query.method).toStrictEqual('deleteMany');
    expect(query.operation).toStrictEqual('delete');
    expect(query.scope).toStrictEqual('collection');
    expect(query.dataType).toBe(api.getDataType('Customer'));
  })

  it('Should create query with "filter" option (string)', async () => {
    const resource = api.getEntityResource('Customers');
    const query = new OpraDeleteCollectionQuery(resource, {filter: 'id=1'});
    expect(query.filter).toBeDefined();
    expect(typeof query.filter).toStrictEqual('object');
    expect(query.filter?.kind).toStrictEqual('ComparisonExpression');
  })

  it('Should create query with "filter" option (Expression)', async () => {
    const resource = api.getEntityResource('Customers');
    const query = new OpraDeleteCollectionQuery(resource, {filter: parseFilter('address.code=1')});
    expect(query.filter).toBeDefined();
    expect(typeof query.filter).toStrictEqual('object');
    expect(query.filter?.kind).toStrictEqual('ComparisonExpression');
  })


});
