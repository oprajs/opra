/* eslint-disable no-console */
import express from 'express';
import { OpraExpressAdapter } from '../../../src/index.js';
import { createTestDocument } from './create-document.js';

async function run() {
  const service = await createTestDocument();
  // console.log(util.inspect(service, {depth: 10, colors: true}));
  const app = express();
  await OpraExpressAdapter.init(app, service, {prefix: '/svc1'});
  const port = 3001;
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/svc1`)
  })

}

run().catch(e => console.error(e));

