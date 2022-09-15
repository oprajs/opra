/* eslint-disable no-console */
import express from 'express';
import * as util from 'util';
import { OpraExpressAdapter, OpraService } from '../../../src/index.js';
import { countriesResource } from './api/countries.resource.js';
import { CustomerAddressesesResource } from './api/customer-addresseses.resource.js';
import { CustomersResource } from './api/customers.resource.js';
import { Customer } from './dto/customer.dto.js';

async function run() {
  const service = await OpraService.create({
    info: {
      title: 'TestApi',
      version: 'v1',
    },
    types: [Customer],
    resources: [countriesResource, new CustomersResource(), new CustomerAddressesesResource()]
  });
  console.log(util.inspect(service, {depth: 10, colors: true}));

  const app = express();
  const port = 3001;
  await OpraExpressAdapter.init(app, service, {prefix: '/svc1'});
  app.listen(port, () => {
    console.log(`Listening on port ${port}`)
  })

}

run().catch(e => console.error(e));

