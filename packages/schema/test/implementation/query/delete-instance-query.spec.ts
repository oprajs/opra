import { OpraDeleteInstanceQuery, OpraService } from '@opra/schema';
import { CustomerAddressesResource } from '../../_support/resources/customer-addresses.resource.js';
import { CustomersResource } from '../../_support/resources/customers.resource.js';

describe('DeleteInstanceQuery', function () {
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
    const query = new OpraDeleteInstanceQuery(resource, 1);
    expect(query.resource).toStrictEqual(resource);
    expect(query.method).toStrictEqual('delete');
    expect(query.operation).toStrictEqual('delete');
    expect(query.scope).toStrictEqual('instance');
    expect(query.dataType).toBe(service.getDataType('Customer'));
    expect(query.keyValue).toStrictEqual(1);
  })

});
