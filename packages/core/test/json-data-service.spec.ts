import { JsonDataService } from '../src';
import { Customer } from './_support/test-app/dto/customer.dto.js';
import customerData from './_support/test-app/data/customers.data';

describe('JsonDataService', function () {

  const customerService = new JsonDataService<Customer>(Customer, customerData);
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
  it('Should search records', async () => {
    const v = customerService.findAll({
      ...commonQuery,
      operation: 'search'
    });
    expect(v).toBeDefined();
    expect(Array.isArray(v)).toStrictEqual(true);
  })

});
