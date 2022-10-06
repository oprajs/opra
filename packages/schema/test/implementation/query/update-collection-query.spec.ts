import { OpraService, OpraUpdateCollectionQuery } from '@opra/schema';
import { parseFilter } from '@opra/url';
import { CustomerAddressesResource } from '../../_support/resources/customer-addresses.resource.js';
import { CustomersResource } from '../../_support/resources/customers.resource.js';

describe('DeleteCollectionQuery', function () {
  let service: OpraService;
  const data = {givenName: 'john'};

  beforeAll(async () => {
    service = await OpraService.create({
      info: {
        title: 'TestApi',
        version: 'v1',
      },
      types: [],
      resources: [new CustomersResource(), new CustomerAddressesResource()]
    });
  });

  it('Should create query', async () => {
    const resource = service.getEntityResource('Customers');
    const query = new OpraUpdateCollectionQuery(resource, data);
    expect(query.resource).toStrictEqual(resource);
    expect(query.method).toStrictEqual('updateMany');
    expect(query.operation).toStrictEqual('update');
    expect(query.scope).toStrictEqual('collection');
    expect(query.dataType).toBe(service.getDataType('Customer'));
    expect(query.data).toStrictEqual(data);
  })

  it('Should create query with "filter" option (string)', async () => {
    const resource = service.getEntityResource('Customers');
    const query = new OpraUpdateCollectionQuery(resource, data, {filter: 'id=1'});
    expect(query.filter).toBeDefined();
    expect(typeof query.filter).toStrictEqual('object');
    expect(query.filter?.kind).toStrictEqual('ComparisonExpression');
  })

  it('Should create query with "filter" option (Expression)', async () => {
    const resource = service.getEntityResource('Customers');
    const query = new OpraUpdateCollectionQuery(resource, data, {filter: parseFilter('address.code=1')});
    expect(query.filter).toBeDefined();
    expect(typeof query.filter).toStrictEqual('object');
    expect(query.filter?.kind).toStrictEqual('ComparisonExpression');
  })


});
