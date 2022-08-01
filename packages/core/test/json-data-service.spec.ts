import { JsonResourceService } from '../src';
import { Customer } from './_support/dto/customer.dto.js';
import customerData from './_support/test-app/customers.data.js';

describe('JsonDataService', function () {

  const customerService = new JsonResourceService<Customer>(Customer, customerData);
  const commonQuery = {
    resourceName: 'Customer',
    path: '',
    returnType: Customer
  }

  it('Should get record by id', async () => {
    const v = customerService.get({
      ...commonQuery,
      key: '1',
      operation: 'read'
    });
    expect(v).toBeDefined();
    expect(v.id).toStrictEqual(1);
  })
  it('Should list records', async () => {
    const v = customerService.findAll({
      ...commonQuery,
      operation: 'list'
    });
    expect(v).toBeDefined();
    expect(Array.isArray(v)).toStrictEqual(true);
  })

});
