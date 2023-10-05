import { OpraTestClient } from '@opra/testing';
import { singletonTests } from '../../../core/test/e2e/tests/index.js';
import { createTestApp, TestApp } from '../_support/test-app/index.js';

describe('e2e:Singleton', function () {
  let app: TestApp;
  let client: OpraTestClient;
  const testArgs: any = {};

  beforeAll(async () => {
    app = await createTestApp();
    client = new OpraTestClient(app.adapter.server, {api: app.document});
    testArgs.app = app;
    testArgs.client = client;
  });

  afterAll(async () => {
    await app?.client.close();
  })

  afterAll(() => global.gc && global.gc());

  // @ts-ignore
  singletonTests.call(this, testArgs);

});

