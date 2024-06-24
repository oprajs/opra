import '@opra/sqb';
import { CustomerApplication } from 'express-mongo';
import { OpraTestClient } from '@opra/testing';
import { entityTests } from '../../../core/test/http/e2e/tests/index.js';

describe('e2e tests', function () {
  let app: CustomerApplication;
  let client: OpraTestClient;
  const testArgs: any = {};

  beforeAll(async () => {
    app = await CustomerApplication.create({ basePath: '/api/v1' });
    client = new OpraTestClient(app.adapter.app, { document: app.document, basePath: '/api/v1' });
    testArgs.app = app;
    testArgs.client = client;
  });

  afterAll(async () => {
    await app?.close();
  });

  // @ts-ignore
  entityTests.call(this, testArgs);
});
