/* eslint-disable no-console */
import cors from 'cors';
import express from 'express';
import { OpraExpressAdapter } from '../../../src/index.js';
import { createTestDocument } from './create-document.js';

export async function run() {
  const service = await createTestDocument();
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

