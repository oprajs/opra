import { ApiDocument } from '@opra/common';
import { createTestApi } from '@opra/core/test/_support/test-app';
import { MongoAdapter } from '@opra/mongodb';

describe('MongoAdapter.transformKeyValues', function () {

  let api: ApiDocument;

  beforeAll(async () => {
    api = await createTestApi();
  });

  it('Should transform using single primitive key value', async () => {
    const out = MongoAdapter.transformKeyValues(api.getCollection('countries'), 1);
    expect(out).toStrictEqual({code: 1});
  });

});

