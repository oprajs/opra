import { MongoAdapter } from '@opra/mongodb';

describe('MongoAdapter.prepareKeyValues', function () {

  afterAll(() => global.gc && global.gc());

  it('Should prepare single key', async () => {
    const out = MongoAdapter.prepareKeyValues(1);
    expect(out).toStrictEqual({_id: 1});
  });

  it('Should prepare multiple key', async () => {
    const out = MongoAdapter.prepareKeyValues({userId: 1, active: true}, ['userId', 'active']);
    expect(out).toStrictEqual({userId: 1, active: true});
  });

});

