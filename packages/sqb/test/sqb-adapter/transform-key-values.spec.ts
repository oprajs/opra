import { ApiDocument } from '@opra/common';
import { createTestApi } from '@opra/core/test/_support/test-app';
import { SQBAdapter } from '@opra/sqb';

describe('SQBAdapter.transformKeyValues', function () {

  let api: ApiDocument;

  beforeAll(async () => {
    api = await createTestApi();
  });

  it('Should transform using single primitive key value', async () => {
    const out = SQBAdapter.transformKeyValues(api.getCollection('customers'), 1);
    expect(out).toStrictEqual({_id: 1});
  });

});

