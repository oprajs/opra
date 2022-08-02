/* eslint-disable no-console */
import express from 'express';
import * as util from 'util';
import { OpraExpressAdapter, OpraService } from '../../../src';
import { Customer } from '../dto/customer.dto';
import { customerResource } from './customer.resource';
import { CustomerAddressResource } from './customer-address.resource';

async function run() {
  const service = await OpraService.create({
    info: {
      title: 'TestApi',
      version: 'v1',
    },
    types: [Customer],
    resources: [customerResource, new CustomerAddressResource()]
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

