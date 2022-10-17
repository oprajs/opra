import '@sqb/postgres';
import express from 'express';
import { OpraExpressAdapter } from '@opra/core';
import { OpraApi } from '@opra/schema';
import { SqbClient } from '@sqb/connect';
import { createTestSchema } from '../create-db.js';
import { CountriesResource } from './resources/countries.resource.js';
import { CustomersResource } from './resources/customers.resource.js';

export * from './resources/countries.resource.js';
export * from './resources/customers.resource.js';
export * from './services/customer.service.js';

export * from './entities/customer-note.entity.js';
export * from './types/person.type.js';

export * from './entities/country.entity.js';
export * from './entities/customer.entity.js';
export * from './entities/record.entity.js';

export interface TestApp {
  db: SqbClient;
  api: OpraApi;
  server: express.Express
}

export async function createApp(): Promise<TestApp> {
  await createTestSchema();
  const db = new SqbClient({
    dialect: 'postgres',
    schema: 'opra_test'
  })
  const api = await OpraApi.create({
    info: {
      title: 'TestApi',
      version: 'v1',
    },
    resources: [
      new CustomersResource(db),
      new CountriesResource(db)
    ]
  })
  const server = express();
  await OpraExpressAdapter.init(server, api);
  return {
    db,
    api,
    server
  }


}

