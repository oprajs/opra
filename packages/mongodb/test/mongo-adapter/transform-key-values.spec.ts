import { ApiDocument } from '@opra/common';
import { MongoAdapter } from '@opra/mongodb';
import { createTestApp } from '../../../sqb/test/_support/test-app/index.js';

describe('MongoAdapter.transformKeyValues', function () {

  let api: ApiDocument;

  beforeAll(async () => {
    api = (await createTestApp()).api;
  });

  afterAll(() => global.gc && global.gc());

  it('Should transform using single primitive key value', async () => {
    const out = MongoAdapter.transformKeyValues(api.getCollection('customers'), 1);
    expect(out).toStrictEqual({_id: 1});
  });

});

