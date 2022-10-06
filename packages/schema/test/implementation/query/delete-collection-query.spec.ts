import { OpraDeleteCollectionQuery, OpraService } from '@opra/schema';
import { parseFilter } from '@opra/url';
import { CustomerAddressesResource } from '../../_support/resources/customer-addresses.resource.js';
import { CustomersResource } from '../../_support/resources/customers.resource.js';

describe('DeleteCollectionQuery', function () {
  let service: OpraService;

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
    const query = new OpraDeleteCollectionQuery(resource);
    expect(query.resource).toStrictEqual(resource);
    expect(query.method).toStrictEqual('deleteMany');
    expect(query.operation).toStrictEqual('delete');
    expect(query.scope).toStrictEqual('collection');
    expect(query.dataType).toBe(service.getDataType('Customer'));
  })

  it('Should create query with "filter" option (string)', async () => {
    const resource = service.getEntityResource('Customers');
    const query = new OpraDeleteCollectionQuery(resource, {filter: 'id=1'});
    expect(query.filter).toBeDefined();
    expect(typeof query.filter).toStrictEqual('object');
    expect(query.filter?.kind).toStrictEqual('ComparisonExpression');
  })

  it('Should create query with "filter" option (Expression)', async () => {
    const resource = service.getEntityResource('Customers');
    const query = new OpraDeleteCollectionQuery(resource, {filter: parseFilter('address.code=1')});
    expect(query.filter).toBeDefined();
    expect(typeof query.filter).toStrictEqual('object');
    expect(query.filter?.kind).toStrictEqual('ComparisonExpression');
  })


});
