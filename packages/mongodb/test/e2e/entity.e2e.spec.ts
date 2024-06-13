import '@opra/sqb';
import { OpraTestClient } from '@opra/testing';
import { entityTests } from '../../../core/test/http/e2e/tests/index.js';
import { TestApp } from '../_support/test-app/index.js';

describe('e2e tests', function () {
  let app: TestApp;
  let client: OpraTestClient;
  const testArgs: any = {};

  beforeAll(async () => {
    app = await TestApp.create();
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
