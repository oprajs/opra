/* eslint-disable no-console */
import cors from 'cors';
import express from 'express';
import { DocumentFactory } from '@opra/common';
import { OpraExpressAdapter } from '@opra/core';
import { GenderEnum } from './enums/gender.enum.js';
import { BestCustomerResource } from './resource/best-customer.resource.js';
import { CustomersResource } from './resource/customers.resource.js';

async function run() {
  console.log(OpraExpressAdapter);
  const service = await DocumentFactory.createDocument({
    version: '1.0',
    info: {
      title: 'TestApi',
      version: 'v1',
    },
    types: [GenderEnum],
    resources: [CustomersResource, BestCustomerResource]
  });
  // console.log(util.inspect(service, {depth: 10, colors: true}));
  const app = express();
  app.use(cors());
  await OpraExpressAdapter.create(app, service, {
    prefix: '/svc1',
    logger: console
  });
  const port = 3001;
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/svc1`)
  })
}

run().catch(e => console.error(e));

