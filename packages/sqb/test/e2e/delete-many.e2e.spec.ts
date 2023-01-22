import { OpraTestClient } from '@opra/testing';
import { createApp, TestApp } from '../_support/app/index.js';

describe('e2e: deleteMany', function () {
  let app: TestApp;
  let client: OpraTestClient;

  beforeAll(async () => {
    app = await createApp();
    client = new OpraTestClient(app.server, {document: app.document});
  });

  afterAll(async () => {
    await app?.db.close(0);
  })

  it('Should delete many instances by filter', async () => {
    const resp = await client.collection('Customers')
        .deleteMany({filter: 'id=102'})
        .fetch('response');
    resp.expect
        .toSuccess()
        .toReturnOperationResult()
        .toBeAffectedExact(1);
    await expect(() => client.collection('Customers')
        .get(102)
        .fetch()
    ).rejects.toThrow('404');
  })
});

