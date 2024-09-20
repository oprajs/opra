import '@opra/sqb';
import { OpraTestClient } from '@opra/testing';
import { CustomerApplication } from 'express-sqb';
import { entityTests } from '../../../http/test/e2e/tests/index.js';

describe('e2e tests', function () {
  let app: CustomerApplication;
  let client: OpraTestClient;
  const testArgs: any = {};

  beforeAll(async () => {
    app = await CustomerApplication.create();
    client = new OpraTestClient(app.adapter.app, { document: app.document });
    testArgs.app = app;
    testArgs.client = client;
  });

  afterAll(async () => {
    await app?.close();
  });

  // @ts-ignore
  entityTests.call(this, testArgs);
});
