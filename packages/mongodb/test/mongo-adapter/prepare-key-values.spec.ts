import { ApiDocument } from '@opra/common';
import { MongoAdapter } from '@opra/mongodb';
import { createTestApp } from '../_support/test-app/index.js';

describe('MongoAdapter.prepareKeyValues', function () {

  let api: ApiDocument;

  beforeAll(async () => {
    api = (await createTestApp()).api;
  });

  afterAll(() => global.gc && global.gc());

  it('Should transform using single primitive key value', async () => {
    const out = MongoAdapter.prepareKeyValues(api.getCollection('customers'), 1);
    expect(out).toStrictEqual({_id: 1});
  });

});

