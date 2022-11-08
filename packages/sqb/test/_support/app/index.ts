import '@sqb/postgres';
import express from 'express';
import { OpraExpressAdapter } from '@opra/core';
import { OpraDocument } from '@opra/schema';
import { SqbClient } from '@sqb/connect';
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
  api: OpraDocument;
  server: express.Express
}

export async function createApp(): Promise<TestApp> {
  const db = new SqbClient({
    dialect: 'postgres',
    schema: 'opra_test'
  })
  const api = await OpraDocument.create({
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

