/* eslint-disable no-console */
import express from 'express';
import * as util from 'util';
import { OpraExpressAdapter } from '../../../src/index.js';
import { createTestService } from './create-service.js';

async function run() {
  const service = await createTestService();
  console.log(util.inspect(service, {depth: 10, colors: true}));
  const app = express();
  await OpraExpressAdapter.init(app, service, {prefix: '/svc1'});
  const port = 3001;
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/svc1`)
  })

}

run().catch(e => console.error(e));

