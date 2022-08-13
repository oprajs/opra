/* eslint-disable no-console */
import express from 'express';
import * as util from 'util';
import { CustomerResource } from '@opra/nestjs/test/_support/test-app/svc/customer/customer.resource';
import { OpraExpressAdapter, OpraService } from '../../../src';
import { Customer } from '../dto/customer.dto';
import { countriesResource } from './countries.resource';
import { CustomerAddressesResource } from './customer-addresses.resource';

async function run() {
  const service = await OpraService.create({
    info: {
      title: 'TestApi',
      version: 'v1',
    },
    types: [Customer],
    resources: [countriesResource, new CustomerResource(), new CustomerAddressesResource()]
  });
  console.log(util.inspect(service, {depth: 10, colors: true}));

  const app = express();
  const port = 3001;
  OpraExpressAdapter.init(app, service, {prefix: '/svc1'});
  app.listen(port, () => {
    console.log(`Listening on port ${port}`)
  })

}

run().catch(e => console.error(e));

