/* eslint-disable no-console */
import express from 'express';
import * as util from 'util';
import { OpraExpressAdapter } from '../../../src';
import { OpraServiceFactory } from '../../../src/implementation/service-factory';
import { Customer } from '../dto/customer.dto';
import { customerResource } from './customer.resource';
import { CustomerAddressResource } from './customer-address.resource';

// import { OpraExpressAdapter } from '../../../src';

async function run() {
  const service = await OpraServiceFactory.create({
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

