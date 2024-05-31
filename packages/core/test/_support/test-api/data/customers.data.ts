import { customersData as customersData_ } from '../../../../../../support/test/customers.data.js';
import { Customer } from '../entities/customer.entity.js';
import { Address } from '../types/address.type.js';

const Data = {
  idGen: 0,
  customers: JSON.parse(JSON.stringify(customersData_)) as Customer[],
  addresses: {} as Record<string, Address[]>,
};

Data.customers.forEach(x => (x._id = Data.idGen++));

export { Data };
