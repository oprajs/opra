import { before } from 'node:test';
import { initDatabase as initElasticDb } from '../../examples/_lib/customer-elastic/src/init-database.js';
import { initDatabase as initMongoDb } from '../../examples/_lib/customer-mongo/src/init-database.js';
import { initDatabase as initSqb } from '../../examples/_lib/customer-sqb/src/init-database.js';
import { countriesData } from '../../examples/_lib/data/countries-data.js';
import { customersData } from '../../examples/_lib/data/customers-data.js';

before(async () => {
  if (process.env.INIT_ELASTIC && process.env.SKIP_ELASTIC_TESTS !== 'true') {
    await initElasticDb({
      // recreate: true,
      countries: countriesData,
      customers: customersData.map(
        (x: any) => ({ ...x, id: x._id, _id: undefined }) as any,
      ),
    });
  }
  if (process.env.INIT_MONGODB && process.env.SKIP_MONGO_TESTS !== 'true') {
    await initMongoDb({
      countries: countriesData,
      customers: customersData,
    });
  }
  if (process.env.INIT_SQB && process.env.SKIP_SQB_TESTS !== 'true') {
    await initSqb({
      countries: countriesData,
      customers: customersData,
    });
  }
});
