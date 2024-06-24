/* eslint-disable import-x/extensions */
import { initDatabase } from '../../../examples/_lib/customer-sqb/src/init-database';
import { countriesData } from '../../../examples/_lib/data/countries-data';
import { customersData } from '../../../examples/_lib/data/customers-data';

export default async function globalSetup() {
  await initDatabase({
    countries: countriesData,
    customers: customersData,
  });
}
