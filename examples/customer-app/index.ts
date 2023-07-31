/* eslint-disable no-console */
import '@sqb/postgres';
import '@opra/sqb';
import cors from 'cors';
import express from 'express';
import { DocumentFactory } from '@opra/common';
import { OpraExpressAdapter } from '@opra/core';
import { SqbClient } from '@sqb/connect';
import { createDatabase } from './db-schema.js';
import { GenderEnum } from './enums/gender.enum.js';
import { CountryResource } from './resources/country.resource.js';
import { CustomersResource } from './resources/customers.resource.js';
import { CountryService } from './services/country.service.js';
import { CustomerService } from './services/customer.service.js';

async function run() {
  const schema = 'opra_example1';
  const dbClient = new SqbClient({
    dialect: 'postgres',
    schema
  });
  await dbClient.test();
  try {
    await createDatabase(dbClient, schema);
    const api = await DocumentFactory.createDocument({
      version: '1.0',
      info: {
        title: 'TestApi',
        version: 'v1',
      },
      types: [GenderEnum],
      resources: [
        new CountryResource(new CountryService(dbClient)),
        new CustomersResource(new CustomerService(dbClient))
        // CustomersResource, BestCustomerResource
      ]
    });
    // console.log(util.inspect(service, {depth: 10, colors: true}));
    const app = express();
    app.use(cors());
    await OpraExpressAdapter.create(app, api, {
      basePath: '/svc1',
      logger: console
    });
    const port = 3001;
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}/svc1`)
    })
  } catch (e) {
    await dbClient.close();
    throw e;
  }
}

run().catch(e => console.error(e));
