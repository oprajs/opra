/* eslint-disable import-x/extensions */
import { initDatabase } from '../../../../examples/_lib/customer-elastic/src/init-database';
import { countriesData } from '../../../../examples/_lib/data/countries-data';
import { customersData } from '../../../../examples/_lib/data/customers-data';

export default async function globalSetup() {
  await initDatabase({
    // recreate: true,
    countries: countriesData,
    customers: customersData.map(
      x => ({ ...x, id: x._id, _id: undefined }) as any,
    ),
  });
}
